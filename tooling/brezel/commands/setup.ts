import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { emitKeypressEvents } from "node:readline"
import { runComposeCommandStreamingCaptured } from "../lib/compose"
import { ensureProjectEnvFile, getProjectEnvPath, readEnvValue, writeEnvValue } from "../lib/env"
import { getProjectDir } from "../lib/exec"
import { runServeCommand } from "./serve"

const ansi = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
}

const brezelLogo = [
  "             ,@@**             ",
  "         .&@@@@&*****,         ",
  "      (&&&@@@@@&********       ",
  "   %&&&&&&&&@@@&********       ",
  "&&&&&&&&&&&&&&&&********       ",
  "%%%%&&&&&&&&*   ,,,*****       ",
  "%%%%%%%&(      /,,,,,,,*       ",
  "%%%%%%%#       *,,,,,,,,***    ",
  "#%%%%%%#         ,,,,,,,*******",
  "#######%#             ,&/******",
  "#######%%%%%.      &&&&@@@@#***",
  "#######%%%%%%%%*&&&&&&&@@@@@@@#",
  "  ,####%%%%%%%%&&&&&&&&@@@@@%  ",
  "      /%%%%%%%%&&&&&&&&@%.     ",
  "         ,%%%%%&&&&&&*         ",
]

const maxLogoWidth = Math.max(...brezelLogo.map((line) => line.length))

type SetupOutput = {
  title: string
  lines: string[]
  success: boolean
  live?: boolean
}

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
  if (args.length > 0) {
    console.error("brezel setup does not accept additional arguments.")
    return 1
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error("brezel setup requires an interactive terminal.")
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

    const finalSystemIdentifier = await maybeRenameSystem(ui, currentSystemIdentifier, envPath)
    writeEnvValue(envPath, "APP_SYSTEM", finalSystemIdentifier)

    if (await runSetupStep(ui, "Rebuilding local Docker images", ["build", "deps", "app", "workers", "scheduler", "mariadb"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Installing Composer dependencies", ["run", "--rm", "deps"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Installing npm dependencies", ["run", "--rm", "node_deps"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Preparing database and app container", ["up", "-d", "mariadb", "app"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, "Initializing Brezel", ["exec", "app", "php", "bakery", "init"]) !== 0) {
      return 1
    }

    if (await runSetupStep(ui, `Creating system '${finalSystemIdentifier}'`, ["exec", "app", "php", "bakery", "system", "create", finalSystemIdentifier]) !== 0) {
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

  return await runServeCommand([])
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

async function maybeRenameSystem(ui: ReturnType<typeof createSetupUi>, currentIdentifier: string, envPath: string): Promise<string> {
  const shouldRename = await askYesNo(ui, `Current system identifier is '${currentIdentifier}'. Rename it?`, false)
  if (!shouldRename) {
    return currentIdentifier
  }

  while (true) {
    const nextIdentifier = (await askPrompt(ui, {
      title: "Rename system",
      message: "Choose the identifier used for the system directory, hostnames, and APP_SYSTEM.",
      hint: `Current identifier: ${currentIdentifier}`,
      placeholder: currentIdentifier,
      value: currentIdentifier,
    })).trim()

    if (!isValidIdentifier(nextIdentifier)) {
      ui.setOutput({
        title: "Rename system",
        lines: ["Use only lowercase letters, digits, '-' and '_' for the system identifier."],
        success: false,
      })
      continue
    }

    if (nextIdentifier === currentIdentifier) {
      return currentIdentifier
    }

    renameSystem(currentIdentifier, nextIdentifier)
    writeEnvValue(envPath, "APP_SYSTEM", nextIdentifier)
    ui.setOutput({
      title: "Rename system",
      lines: [`Renamed system '${currentIdentifier}' to '${nextIdentifier}'.`],
      success: true,
    })
    return nextIdentifier
  }
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

  ui.setOutput(buildSetupOutput(title, result.stdout, result.stderr, result.exitCode))
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
    for (const line of renderOutputBlock(ui.output)) {
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
  lines.push(displayValue)

  if (prompt.hint) {
    lines.push("")
    lines.push(`${paint(ansi.dim)}${prompt.hint}${paintReset()}`)
  }

  return renderInlineBoxLines(lines)
}

function renderOutputBlock(output: SetupOutput): string[] {
  const maxLines = 12
  const visibleLines = output.lines.length > maxLines
    ? [`... showing last ${maxLines} lines of ${output.lines.length}`, ...output.lines.slice(-maxLines)]
    : output.lines

  const statusColor = output.success ? ansi.green : ansi.yellow
  const header = `${paint(statusColor, ansi.bold)}${output.live ? "Running" : "Output"}:${paintReset()} ${output.title}`
  return renderInlineBoxLines([header, "", ...(visibleLines.length > 0 ? visibleLines : ["No output yet."])])
}

function renderInlineBox(line: string): string[] {
  return renderInlineBoxLines([line])
}

function renderInlineBoxLines(lines: string[]): string[] {
  const visibleWidth = lines.reduce((max, line) => Math.max(max, stripAnsi(line).length), 0)
  const horizontal = "─".repeat(visibleWidth + 2)

  return [
    `${paint(ansi.dim)}┌${horizontal}┐${paintReset()}`,
    ...lines.map((line) => `${paint(ansi.dim)}│ ${paintReset()}${padVisible(line, visibleWidth)}${paint(ansi.dim)} │${paintReset()}`),
    `${paint(ansi.dim)}└${horizontal}┘${paintReset()}`,
  ]
}

function renderLogoLine(line: string, row: number, shimmerFrame: number): string {
  if (!process.stdout.isTTY) {
    return line
  }

  let rendered = ""
  let activeColor = ""
  const shimmerCenter = (shimmerFrame % (maxLogoWidth + 18)) - 8 + row * 0.8

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextColor = getLogoCharacterColor(character, index, shimmerCenter)

    if (nextColor !== activeColor) {
      rendered += nextColor || ansi.reset
      activeColor = nextColor
    }

    rendered += character
  }

  return `${rendered}${ansi.reset}`
}

function getLogoCharacterColor(character: string, column: number, shimmerCenter: number): string {
  const baseColor = getLogoCharacterRgb(character)
  if (!baseColor) {
    return ""
  }

  const distance = Math.abs(column - shimmerCenter)
  const shimmerWidth = 5
  const shimmerStrength = Math.max(0, 1 - distance / shimmerWidth)
  const [red, green, blue] = applyShimmer(baseColor, shimmerStrength)
  return rgb(red, green, blue)
}

function getLogoCharacterRgb(character: string): [number, number, number] | null {
  switch (character) {
    case "@":
      return [255, 214, 13]
    case "&":
      return [255, 166, 32]
    case "%":
      return [255, 70, 84]
    case "#":
      return [176, 64, 72]
    case "*":
      return [232, 62, 62]
    case ",":
    case ".":
    case "/":
    case "(":
    case ")":
      return [196, 84, 84]
    default:
      return null
  }
}

function applyShimmer(color: [number, number, number], strength: number): [number, number, number] {
  if (strength <= 0) {
    return color
  }

  const glow = 0.45 * strength
  return [
    blendChannel(color[0], 255, glow),
    blendChannel(color[1], 248, glow),
    blendChannel(color[2], 220, glow),
  ]
}

function blendChannel(base: number, target: number, amount: number): number {
  return Math.round(base + (target - base) * amount)
}

function centerLine(line: string): string {
  if (!process.stdout.isTTY) {
    return line
  }

  const terminalWidth = process.stdout.columns || 80
  const visibleLength = stripAnsi(line).length
  if (visibleLength >= terminalWidth) {
    return line
  }

  return `${" ".repeat(Math.floor((terminalWidth - visibleLength) / 2))}${line}`
}

function padVisible(line: string, width: number): string {
  const visibleLength = stripAnsi(line).length
  if (visibleLength >= width) {
    return line
  }

  return `${line}${" ".repeat(width - visibleLength)}`
}

function statusLine(parts: string[]): string {
  return `${paint(ansi.dim)}${parts.join("  |  ")}${paintReset()}`
}

function paint(...codes: string[]): string {
  if (!process.stdout.isTTY) {
    return ""
  }

  return codes.join("")
}

function paintReset(): string {
  if (!process.stdout.isTTY) {
    return ""
  }

  return ansi.reset
}

function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, "")
}

function rgb(red: number, green: number, blue: number): string {
  return `\u001b[38;2;${red};${green};${blue}m`
}

function buildSetupOutput(title: string, stdout: string, stderr: string, exitCode: number): SetupOutput {
  const lines = normalizeOutputLines(stdout, stderr)
  return {
    title,
    lines: lines.length > 0 ? lines : [exitCode === 0 ? "Command completed successfully." : "Command failed without output."],
    success: exitCode === 0,
  }
}

function normalizeOutputLines(stdout: string, stderr: string): string[] {
  const combined = [stdout.trimEnd(), stderr.trimEnd()].filter((value) => value.length > 0).join("\n")
  if (!combined) {
    return []
  }

  return combined.split(/\r?\n/).map((line) => stripAnsi(line))
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

function getSingleSystemIdentifier(): string {
  const systemsDir = join(getProjectDir(), "systems")
  const identifiers = readdirSync(systemsDir)
    .filter((entry) => !entry.startsWith("."))
    .filter((entry) => statSync(join(systemsDir, entry)).isDirectory())

  if (identifiers.length !== 1) {
    throw new Error(`brezel setup currently expects exactly one system directory in 'systems/', found ${identifiers.length}.`)
  }

  return identifiers[0]
}

function renameSystem(currentIdentifier: string, nextIdentifier: string): void {
  const systemsDir = join(getProjectDir(), "systems")
  const currentDir = join(systemsDir, currentIdentifier)
  const nextDir = join(systemsDir, nextIdentifier)

  if (existsSync(nextDir)) {
    throw new Error(`The target system directory '${nextIdentifier}' already exists.`)
  }

  const hostnamesPath = join(currentDir, "hostnames.bake.json")
  const hostnames = JSON.parse(readFileSync(hostnamesPath, "utf-8")) as Array<{ resource_hostname?: string, resource?: { hostname?: string } }>
  const currentHostnameKey = hostnames[0]?.resource_hostname
  const currentHostnameValue = hostnames[0]?.resource?.hostname

  if (!Array.isArray(hostnames) || hostnames.length === 0) {
    throw new Error("Could not parse systems/<system>/hostnames.bake.json.")
  }

  hostnames[0].resource_hostname = nextIdentifier
  if (!hostnames[0].resource) {
    hostnames[0].resource = {}
  }
  hostnames[0].resource.hostname = nextIdentifier
  writeFileSync(hostnamesPath, `${JSON.stringify(hostnames, null, 2)}\n`)

  const identifierCandidates = new Set<string>([
    currentIdentifier,
    currentHostnameKey,
    currentHostnameValue,
    "example",
  ].filter((value): value is string => Boolean(value)))

  rewriteSystemHostnameReferences(currentDir, identifierCandidates, nextIdentifier)
  renameSync(currentDir, nextDir)
}

function rewriteSystemHostnameReferences(systemDir: string, oldIdentifiers: Set<string>, nextIdentifier: string): void {
  for (const filePath of walkFiles(systemDir)) {
    const original = readFileSync(filePath, "utf-8")
    let nextContent = original

    for (const identifier of oldIdentifiers) {
      nextContent = nextContent.replaceAll(`resource_hostname.${identifier}.hostname`, `resource_hostname.${nextIdentifier}.hostname`)
    }

    if (nextContent !== original) {
      writeFileSync(filePath, nextContent)
    }
  }
}

function walkFiles(directory: string): string[] {
  const result: string[] = []

  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) {
      result.push(...walkFiles(fullPath))
      continue
    }

    result.push(fullPath)
  }

  return result
}

function isValidIdentifier(value: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/.test(value)
}

function maskSecret(value: string): string {
  if (value.length <= 8) {
    return `${value.slice(0, 2)}...${value.slice(-2)}`
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

function isPrintableInput(value: string): boolean {
  return !/[\u0000-\u001f\u007f]/.test(value)
}

async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds))
}
