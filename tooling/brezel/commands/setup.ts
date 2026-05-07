import { existsSync } from "node:fs"
import { emitKeypressEvents } from "node:readline"
import { runComposeCommandStreamingCaptured } from "../lib/compose"
import { ensureProjectEnvFile, getProjectEnvPath, readEnvValue, writeEnvValue } from "../lib/env"
import { buildCommandOutput, normalizeOutputLines } from "../lib/output"
import { getSingleSystemIdentifier } from "../lib/system-config"
import { assertInteractiveTerminal, assertNoArgs } from "../lib/validation"
import { ansi, brezelLogo, centerLine, type CommandOutput, isPrintableInput, maxLogoWidth, paint, paintReset, renderCommandOutputBlock, renderInlineBox, renderInlineBoxLines, renderLogoLine, statusLine } from "../lib/ui"
import { runServeCommand } from "./serve"

type SetupOutput = CommandOutput

type PromptState = {
  title: string
  message?: string
  hint?: string
  value: string
  placeholder?: string
  secret?: boolean
}

type SetupUi = {
  prompt: PromptState | null
  output: SetupOutput | null
  step: string
  shimmerFrame: number
  shimmerTimer: ReturnType<typeof setInterval> | null
  running: boolean
}

export async function runSetupCommand(args: string[]): Promise<number> {
  if (!assertNoArgs("brezel setup", args)) {
    return 1
  }

  if (!assertInteractiveTerminal("brezel setup")) {
    return 1
  }

  const ui = createSetupUi()

  try {
    ui.start()

    const envPath = getProjectEnvPath()
    const hadEnv = existsSync(envPath)
    ensureProjectEnvFile()

    if (!hadEnv) {
      ui.setOutput({
        title: "Environment",
        lines: ["Created .env from .env.example."],
        success: true,
      })
    }

    const currentSystemIdentifier = getSingleSystemIdentifier()

    await ensureToken(ui, envPath, "COMPOSER_TOKEN", "Composer token")
    await ensureToken(ui, envPath, "NPM_TOKEN", "npm token")

    writeEnvValue(envPath, "APP_SYSTEM", currentSystemIdentifier)

    if (await runSetupStep(ui, "Rebuilding local Docker images", ["build", "deps", "app", "workers", "scheduler", "mariadb"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Installing Composer dependencies", ["run", "--rm", "deps"]) !== 0) {
      appendSetupRecoveryHint(ui, [
        "Composer dependency installation failed.",
        "Double-check your Composer token and rerun `brezel setup`.",
      ])
      return 1
    }

    if (await runSetupStep(ui, "Installing npm dependencies", ["run", "--rm", "node_deps"]) !== 0) {
      appendSetupRecoveryHint(ui, [
        "npm dependency installation failed.",
        "Double-check your npm token and rerun `brezel setup`.",
      ])
      return 1
    }

    if (await runSetupStep(ui, "Preparing database and app container", ["up", "-d", "mariadb", "app"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Initializing Brezel", ["exec", "app", "php", "bakery", "init"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, `Creating system '${currentSystemIdentifier}'`, ["exec", "app", "php", "bakery", "system", "create", currentSystemIdentifier]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Running database migrations", ["exec", "app", "php", "bakery", "migrate", "--force"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Loading workflows", ["exec", "app", "php", "bakery", "load"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Applying Brezel resources", ["exec", "app", "php", "bakery", "apply"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Restarting the Brezel stack", ["down", "--remove-orphans"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Starting the Brezel stack", ["up", "-d", "--remove-orphans"]) !== 0) {
      return 1
    }

    ui.step = "Setup complete"
    ui.setOutput({
      title: "Ready",
      lines: ["Brezel is configured. Starting the local environment now..."],
      success: true,
    })
    await sleep(600)
  } finally {
    ui.stop()
  }

  return await runServeCommand(["--skip-stack-start"])
}

function createSetupUi(): SetupUi & {
  start: () => void
  stop: () => void
  render: () => void
  setOutput: (output: SetupOutput | null) => void
} {
  const ui = {
    prompt: null,
    output: null,
    step: "Preparing setup",
    shimmerFrame: 0,
    shimmerTimer: null,
    running: false,
  } as SetupUi & {
    start: () => void
    stop: () => void
    render: () => void
    setOutput: (output: SetupOutput | null) => void
  }

  const render = () => renderSetupScreen(ui)

  const start = () => {
    if (ui.running) {
      return
    }

    ui.running = true
    ui.shimmerTimer = setInterval(() => {
      ui.shimmerFrame = (ui.shimmerFrame + 1) % (maxLogoWidth + 12)
      render()
    }, 120)
    render()
  }

  const stop = () => {
    if (!ui.running) {
      return
    }

    ui.running = false
    if (ui.shimmerTimer) {
      clearInterval(ui.shimmerTimer)
      ui.shimmerTimer = null
    }

    if (typeof process.stdin.setRawMode === "function") {
      process.stdin.setRawMode(false)
    }
  }

  const setOutput = (output: SetupOutput | null) => {
    ui.output = output
    render()
  }

  ui.start = start
  ui.stop = stop
  ui.render = render
  ui.setOutput = setOutput

  return ui
}

async function ensureToken(ui: ReturnType<typeof createSetupUi>, envPath: string, key: string, label: string): Promise<void> {
  const existingValue = readEnvValue(envPath, key)

  if (existingValue) {
    const shouldReplace = await askYesNo(ui, `${label} already exists (${maskSecret(existingValue)}). Replace it?`, false)
    if (!shouldReplace) {
      return
    }
  }

  const value = await askPrompt(ui, {
    title: label,
    message: `Enter the ${label.toLowerCase()} used by this Brezel instance.`,
    hint: "Press Enter to confirm.",
    placeholder: label,
    secret: true,
  })
  writeEnvValue(envPath, key, value)
}

async function runSetupStep(ui: ReturnType<typeof createSetupUi>, title: string, composeArgs: string[]): Promise<number> {
  ui.step = title
  ui.setOutput({
    title,
    lines: ["Starting..."],
    success: true,
    live: true,
  })

  let stdout = ""
  let stderr = ""

  const result = await runComposeCommandStreamingCaptured(composeArgs, {
    mirrorStdout: false,
    mirrorStderr: false,
    onStdoutChunk: (chunk) => {
      stdout += chunk
      ui.setOutput({
        title,
        lines: normalizeOutputLines(stdout, stderr),
        success: true,
        live: true,
      })
    },
    onStderrChunk: (chunk) => {
      stderr += chunk
      ui.setOutput({
        title,
        lines: normalizeOutputLines(stdout, stderr),
        success: true,
        live: true,
      })
    },
  })

  ui.setOutput(buildCommandOutput(title, result.stdout, result.stderr, result.exitCode))
  return result.exitCode
}

function renderSetupScreen(ui: SetupUi): void {
  console.clear()
  console.log("")
  console.log("")

  for (const line of brezelLogo.map((entry, index) => renderLogoLine(entry, index, ui.shimmerFrame))) {
    console.log(centerLine(line))
  }

  console.log("")
  for (const line of renderInlineBox(`${paint(ansi.bold, ansi.green)}Welcome to Brezel!${paintReset()}`)) {
    console.log(centerLine(line))
  }

  console.log("")
  console.log(centerLine(`${paint(ansi.dim)}Let's quickly set everything up and get your brezel into the oven.${paintReset()}`))
  console.log(centerLine(statusLine(["mode: setup", `step: ${ui.step}`])))

  if (ui.prompt) {
    console.log("")
    for (const line of renderPromptBlock(ui.prompt)) {
      console.log(centerLine(line))
    }
  }

  if (ui.output) {
    console.log("")
    for (const line of renderCommandOutputBlock(ui.output, { live: "Running", complete: "Output" })) {
      console.log(centerLine(line))
    }
  }

  console.log("")
}

function renderPromptBlock(prompt: PromptState): string[] {
  const displayValue = prompt.value.length > 0
    ? (prompt.secret ? "•".repeat(prompt.value.length) : prompt.value)
    : `${paint(ansi.dim)}${prompt.placeholder || "type here..."}${paintReset()}`

  const lines = [
    `${paint(ansi.bold)}${prompt.title}${paintReset()}`,
  ]

  if (prompt.message) {
    lines.push(prompt.message)
  }

  lines.push("")
  lines.push(`> ${displayValue}`)

  if (prompt.hint) {
    lines.push("")
    lines.push(`${paint(ansi.dim)}${prompt.hint}${paintReset()}`)
  }

  return renderInlineBoxLines(lines)
}

function appendSetupRecoveryHint(ui: ReturnType<typeof createSetupUi>, lines: string[]): void {
  if (!ui.output) {
    return
  }

  ui.setOutput({
    ...ui.output,
    lines: [...ui.output.lines, "", ...lines],
    success: false,
    live: false,
  })
}


async function askYesNo(ui: ReturnType<typeof createSetupUi>, question: string, defaultValue: boolean): Promise<boolean> {
  const defaultLabel = defaultValue ? "Y/n" : "y/N"

  while (true) {
    const answer = (await askPrompt(ui, {
      title: question,
      hint: `Type y or n. Default: ${defaultLabel}`,
      placeholder: defaultLabel,
    })).trim().toLowerCase()

    if (!answer) {
      return defaultValue
    }
    if (["y", "yes"].includes(answer)) {
      return true
    }
    if (["n", "no"].includes(answer)) {
      return false
    }
  }
}

async function askPrompt(ui: ReturnType<typeof createSetupUi>, prompt: Omit<PromptState, "value"> & { value?: string }): Promise<string> {
  emitKeypressEvents(process.stdin)

  return await new Promise<string>((resolve) => {
    const state: PromptState = {
      title: prompt.title,
      message: prompt.message,
      hint: prompt.hint,
      placeholder: prompt.placeholder,
      secret: prompt.secret,
      value: prompt.value ?? "",
    }

    const cleanup = () => {
      process.stdin.removeListener("keypress", onKeypress)
      ui.prompt = null
      if (typeof process.stdin.setRawMode === "function") {
        process.stdin.setRawMode(false)
      }
      ui.render()
    }

    const onKeypress = (_str: string, key: { ctrl?: boolean, name?: string }) => {
      if (key.ctrl && key.name === "c") {
        cleanup()
        ui.stop()
        process.exit(130)
      }

      switch (key.name) {
        case "return":
        case "enter":
          cleanup()
          resolve(state.value)
          return
        case "backspace":
          state.value = state.value.slice(0, -1)
          ui.prompt = state
          ui.render()
          return
        default:
          if (_str && isPrintableInput(_str)) {
            state.value += _str
            ui.prompt = state
            ui.render()
          }
      }
    }

    ui.prompt = state
    process.stdin.on("keypress", onKeypress)
    process.stdin.resume()
    if (typeof process.stdin.setRawMode === "function") {
      process.stdin.setRawMode(true)
    }
    ui.render()
  })
}

function maskSecret(value: string): string {
  if (value.length <= 8) {
    return `${value.slice(0, 2)}...${value.slice(-2)}`
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds))
}
