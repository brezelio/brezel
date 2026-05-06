import { spawnSync } from "node:child_process"
import { join } from "node:path"
import { emitKeypressEvents } from "node:readline"
import { runComposeCommand as runCompose } from "../lib/compose"
import { runBakeryArgsStreamingCaptured } from "../lib/bakery"
import { getCommandMetadata } from "../lib/command-metadata"
import { getProjectEnvValue } from "../lib/env"
import { getProjectDir, runProjectCommandInteractive, runProjectCommandStreamingCaptured } from "../lib/exec"
import { readLoginInfo, type LoginInfo } from "../lib/login-info"
import { buildCommandOutput, normalizeOutputLines } from "../lib/output"
import { readStackStatus, type StackStatus } from "../lib/stack-status"
import { ansi, brezelLogo, centerLine, type CommandOutput, hotkey, isPrintableInput, maxLogoWidth, padVisible, paint, paintReset, renderCommandOutputBlock, renderInlineBox, renderInlineBoxLines, renderLogoLine, statusLine, stripAnsi } from "../lib/ui"
import { startExploreDb } from "./explore-db"
import { runLogsCommand } from "./logs"
import { portIsBusy } from "../lib/ports"

const ports = [2040, 2041, 2042, 2043]

export async function runServeCommand(args: string[]): Promise<number> {
  let interactive = false
  let rebuild = false
  let skipStackStart = false
  const appSystem = getProjectEnvValue("APP_SYSTEM") || "example"

  for (const arg of args) {
    if (arg === "interactive") {
      interactive = true
      continue
    }

    if (arg === "--rebuild") {
      rebuild = true
      continue
    }

    if (arg === "--skip-stack-start") {
      skipStackStart = true
      continue
    }

    console.error("Usage: brezel serve [interactive] [--rebuild]")
    return 1
  }

  if (interactive && !commandExists("zellij")) {
    console.error("zellij is required for brezel serve but was not found in PATH.")
    return 1
  }

  if (!skipStackStart) {
    console.log("Cleaning up any existing Docker stack for this project")
    runCompose(["down", "--remove-orphans"], { profiles: ["db-explore"] })

    for (const port of ports) {
      if (await portIsBusy(port)) {
        showPortConflict(port)
        return 1
      }
    }

    console.log("Starting brezel using Docker Compose")
    if (rebuild) {
      console.log("Rebuilding Docker images first...")
      const buildExitCode = runCompose(["build"])
      if (buildExitCode !== 0) {
        return buildExitCode
      }
    }
    const upExitCode = runCompose(["up", "-d", "--remove-orphans"])
    if (upExitCode !== 0) {
      return upExitCode
    }
  }

  printServeEndpoints(appSystem)

  let cleanedUp = false
  let inForegroundAction = false

  const cleanup = () => {
    if (cleanedUp) {
      return
    }

    cleanedUp = true
    runCompose(["down", "--remove-orphans"], { profiles: ["db-explore"] })
  }

  const handleSignal = (_signal: NodeJS.Signals) => {
    if (inForegroundAction) {
      return
    }

    cleanup()
    process.exit(128)
  }

  process.on("SIGINT", handleSignal)
  process.on("SIGTERM", handleSignal)
  process.on("SIGHUP", handleSignal)

  let sessionExitCode = 0

  if (interactive) {
    const layoutPath = join(getProjectDir(), "bin", "assets", "zellij", "layout.kdl")
    sessionExitCode = await runProjectCommandInteractive({
      unixCommand: "zellij",
      windowsCommand: "zellij",
      args: ["--layout", layoutPath],
    })
  } else {
    sessionExitCode = await runServeControlLoop(appSystem, {
      setForegroundAction(value) {
        inForegroundAction = value
      },
      stop() {
        cleanup()
      },
    })
  }

  process.removeListener("SIGINT", handleSignal)
  process.removeListener("SIGTERM", handleSignal)
  process.removeListener("SIGHUP", handleSignal)

  cleanup()
  return sessionExitCode
}

function printServeEndpoints(appSystem: string): void {
  console.log("\n")
  console.log(renderServeEndpointLine(appSystem))
  console.log("\n")
}

function getServeSpaUrl(appSystem: string): string {
  return `http://${appSystem}.localhost:2040`
}

function renderServeEndpointLine(appSystem: string): string {
  return `Brezel is available at ${getServeSpaUrl(appSystem)}`
}

type ServeControlContext = {
  setForegroundAction: (value: boolean) => void
  stop: () => void
}

type LastActionOutput = CommandOutput

type PromptState = {
  kind: "bakery" | "command"
  value: string
}

type LiveOutputUpdater = (title: string, lines: string[]) => void

async function runServeControlLoop(appSystem: string, context: ServeControlContext): Promise<number> {
  if (!process.stdin.isTTY) {
    console.log("Brezel is running in the foreground.")
    console.log("Press Ctrl+C to stop it and clean up the local Docker stack.")
    return await waitForever()
  }

  emitKeypressEvents(process.stdin)

  let busy = false
  let cleanedUpInput = false
  let showHelp = false
  let shimmerFrame = 0
  let shimmerTimer: ReturnType<typeof setInterval> | null = null
  let statusTimer: ReturnType<typeof setInterval> | null = null
  let lastActionOutput: LastActionOutput | null = null
  let liveActionOutput: LastActionOutput | null = null
  let prompt: PromptState | null = null
  let stackStatus: StackStatus = readStackStatus()
  const loginInfo = readLoginInfo(appSystem)

  const render = () => renderServeControlScreen(appSystem, showHelp, shimmerFrame, liveActionOutput ?? lastActionOutput, prompt, stackStatus, loginInfo)
  const updateLiveActionOutput: LiveOutputUpdater = (title, lines) => {
    liveActionOutput = {
      title,
      lines: lines.length > 0 ? lines : ["Running..."],
      success: true,
      live: true,
    }
    render()
  }

  const restoreRawMode = () => {
    if (typeof process.stdin.setRawMode === "function") {
      process.stdin.setRawMode(true)
    }
  }

  const disableRawMode = () => {
    if (typeof process.stdin.setRawMode === "function") {
      process.stdin.setRawMode(false)
    }
  }

  const cleanupInput = () => {
    if (cleanedUpInput) {
      return
    }

    cleanedUpInput = true
    stopShimmer()
    stopStatusPolling()
    disableRawMode()
    process.stdin.removeListener("keypress", onKeypress)
    process.stdin.pause()
  }

  const startShimmer = () => {
    if (shimmerTimer || cleanedUpInput || !process.stdout.isTTY) {
      return
    }

    shimmerTimer = setInterval(() => {
      if (busy || cleanedUpInput) {
        return
      }

      shimmerFrame = (shimmerFrame + 1) % (maxLogoWidth + 12)
      render()
    }, 120)
  }

  const stopShimmer = () => {
    if (!shimmerTimer) {
      return
    }

    clearInterval(shimmerTimer)
    shimmerTimer = null
  }

  const startStatusPolling = () => {
    if (statusTimer || cleanedUpInput) {
      return
    }

    statusTimer = setInterval(() => {
      if (busy || cleanedUpInput) {
        return
      }

      const nextStatus = readStackStatus()
      if (nextStatus.label !== stackStatus.label || nextStatus.detail !== stackStatus.detail) {
        stackStatus = nextStatus
        render()
      }
    }, 3000)
  }

  const stopStatusPolling = () => {
    if (!statusTimer) {
      return
    }

    clearInterval(statusTimer)
    statusTimer = null
  }

  const runAction = async (action: () => Promise<number> | number, expectedExitCodes: number[] = [0]) => {
    busy = true
    context.setForegroundAction(true)
    stopShimmer()
    disableRawMode()

    try {
      console.log("")
      const exitCode = await action()
      stackStatus = readStackStatus()
      if (!expectedExitCodes.includes(exitCode)) {
        console.log("")
        console.log(`Command exited with status ${exitCode}.`)
      }
    } finally {
      context.setForegroundAction(false)
      if (!cleanedUpInput) {
        process.stdin.resume()
        restoreRawMode()
        render()
        startShimmer()
      }
      busy = false
    }
  }

  const runCapturedAction = async (action: () => Promise<LastActionOutput>) => {
    await runAction(async () => {
      liveActionOutput = {
        title: "Running command",
        lines: ["Starting..."],
        success: true,
        live: true,
      }
      render()
      lastActionOutput = await action()
      liveActionOutput = null
      return lastActionOutput.success ? 0 : 1
    }, [0, 1])
  }

  const onKeypress = async (_str: string, key: { ctrl?: boolean, name?: string }) => {
    if (busy) {
      return
    }

    if (prompt) {
      if (key.ctrl && key.name === "c") {
        prompt = null
        render()
        return
      }

      switch (key.name) {
        case "escape":
          prompt = null
          render()
          return
        case "return":
        case "enter": {
          const command = prompt.value
          const kind = prompt.kind
          prompt = null
          await runCapturedAction(() => kind === "bakery"
            ? runBakeryPromptCommand(command, updateLiveActionOutput)
            : runServeCommandPrompt(command, updateLiveActionOutput))
          return
        }
        case "backspace":
          prompt.value = prompt.value.slice(0, -1)
          render()
          return
        default:
          if (_str && isPrintableInput(_str)) {
            prompt.value += _str
            render()
          }
          return
      }
    }

    if (key.ctrl && key.name === "c") {
      cleanupInput()
      context.stop()
      resolveExit(0)
      return
    }

    switch (key.name) {
      case "q":
        cleanupInput()
        context.stop()
        resolveExit(0)
        return
      case "h":
        showHelp = !showHelp
        render()
        return
      case "b":
        prompt = { kind: "bakery", value: "" }
        render()
        return
      case "x":
        prompt = { kind: "command", value: "" }
        render()
        return
      case "u":
        await runCapturedAction(() => runUpdateCommandCaptured(updateLiveActionOutput))
        return
      case "a":
        await runCapturedAction(() => runApplyCommandCaptured(updateLiveActionOutput))
        return
      case "l":
        await runCapturedAction(() => runLoadCommandCaptured(updateLiveActionOutput))
        return
      case "e":
        await runCapturedAction(() => startExploreDb(updateLiveActionOutput))
        return
      case "p":
        console.log("Opening diagnostics. Press Ctrl+C to return.")
        await runAction(() => runLogsCommand(["all"]), [0, 1, 130])
        return
      case "j":
        console.log("Opening worker logs. Press Ctrl+C to return.")
        await runAction(() => runLogsCommand(["workers"]), [0, 1, 130])
        return
    }
  }

  let resolveExit: (code: number) => void = () => {}

  process.stdin.on("keypress", onKeypress)
  process.stdin.resume()
  restoreRawMode()
  render()
  startShimmer()
  startStatusPolling()

  return await new Promise<number>((resolve) => {
    resolveExit = resolve
  })
}

function renderServeControlScreen(appSystem: string, showHelp: boolean, shimmerFrame: number, lastActionOutput: LastActionOutput | null, prompt: PromptState | null, stackStatus: StackStatus, loginInfo: LoginInfo[]): void {
  clearTerminalScreen()
  console.log("")
  const statusLabel = showHelp ? "help: visible" : "help: hidden"
  for (const line of brezelLogo.map((entry, index) => renderLogoLine(entry, index, shimmerFrame))) {
    console.log(centerLine(line))
  }
  console.log("")

  for (const line of renderInlineBox(renderStackHeadline(stackStatus))) {
    console.log(centerLine(line))
  }

  console.log("")
  console.log(centerLine(statusLine([stackStatus.label, stackStatus.detail, statusLabel])))
  console.log("")
  console.log(centerLine(`${paint(ansi.bold)}${renderServeEndpointLine(appSystem)}${paintReset()}`))
  if (loginInfo.length > 0) {
    console.log("")
    for (const line of renderLoginInfoBlock(loginInfo)) {
      console.log(centerLine(line))
    }
  }
  console.log("")

  if (showHelp) {
      console.log(
        centerLine(
          `${paint(ansi.dim)}Actions:${paintReset()} ` +
          `${hotkey("b")} bakery  ${hotkey("x")} brezel  ${hotkey("u")} update  ${hotkey("a")} apply  ${hotkey("l")} load  ` +
          `${hotkey("e")} explore db  ${hotkey("p")} peek  ${hotkey("j")} jobs  ${hotkey("q")} quit  ${hotkey("h")} hide help`
        )
      )
  } else {
    console.log(centerLine(`${paint(ansi.dim)}Press ${hotkey("h")} for controls, ${hotkey("q")} or ${hotkey("Ctrl+C")} to stop Brezel.${paintReset()}`))
  }

  if (prompt) {
    console.log("")
    for (const line of renderPromptBlock(prompt)) {
      console.log(centerLine(line))
    }
  }

  if (lastActionOutput) {
    console.log("")
    for (const line of renderCommandOutputBlock(lastActionOutput, { live: "Running", complete: "Last output" })) {
      console.log(centerLine(line))
    }
  }
}

function clearTerminalScreen(): void {
  if (process.stdout.isTTY) {
    process.stdout.write("\u001b[2J\u001b[H")
    return
  }

  console.clear()
}

function renderStackHeadline(stackStatus: StackStatus): string {
  switch (stackStatus.phase) {
    case "running":
      return `${paint(ansi.bold, ansi.green)}Brezel is running${paintReset()}`
    case "restarting":
      return `${paint(ansi.bold, ansi.yellow)}Brezel is restarting${paintReset()}`
    case "stopped":
      return `${paint(ansi.bold, ansi.yellow)}Brezel is stopped${paintReset()}`
    default:
      return `${paint(ansi.bold, ansi.yellow)}Brezel status is unknown${paintReset()}`
  }
}

function renderLoginInfoBlock(loginInfo: LoginInfo[]): string[] {
  const rows = chunkLoginInfoRows(loginInfo, 3)
  const roleLabelWidth = Math.max(...loginInfo.map((entry) => entry.root ? 4 : 4))
  const cards = loginInfo.map((entry) => formatLoginLines(entry, roleLabelWidth))
  const cardWidth = Math.max(...cards.flatMap((lines) => lines.map((line) => stripAnsi(line).length)))

  const rowLines = rows.flatMap((entries, rowIndex) => {
    const rowCards = entries.map((entry) => formatLoginLines(entry, roleLabelWidth))
    const maxCardHeight = Math.max(...rowCards.map((lines) => lines.length))

    const renderedRow = Array.from({ length: maxCardHeight }, (_value, index) => rowCards
      .map((card) => padVisible(card[index] || "", cardWidth))
      .join("    ")
      .trimEnd())

    return rowIndex < rows.length - 1 ? [...renderedRow, ""] : renderedRow
  })

  const lines = [
    `${paint(ansi.bold)}Login information${paintReset()}`,
    "",
    ...rowLines,
  ]

  return renderInlineBoxLines(lines)
}

function formatLoginLines(entry: LoginInfo, roleLabelWidth: number): string[] {
  const label = entry.root
    ? `${paint(ansi.bold, ansi.green)}ROOT${paintReset()}`
    : `${paint(ansi.bold)}USER${paintReset()}`
  const labelPadding = " ".repeat(roleLabelWidth)

  return [
    `${padVisible(label, roleLabelWidth)}  email: ${entry.email}`,
    `${labelPadding}  password: ${entry.password}`,
  ]
}

function chunkLoginInfoRows(loginInfo: LoginInfo[], maxPerRow: number): LoginInfo[][] {
  const rows: LoginInfo[][] = []

  for (let index = 0; index < loginInfo.length; index += maxPerRow) {
    rows.push(loginInfo.slice(index, index + maxPerRow))
  }

  return rows
}

function renderPromptBlock(prompt: PromptState): string[] {
  const title = prompt.kind === "bakery" ? "Bakery command" : "Brezel command"
  const prefix = prompt.kind === "bakery" ? "brezel bakery " : "brezel "
  const placeholder = prompt.kind === "bakery"
    ? "type a bakery command..."
    : "type any brezel command..."
  const displayValue = prompt.value.length > 0 ? prompt.value : `${paint(ansi.dim)}${placeholder}${paintReset()}`

  return renderInlineBoxLines([
    `${paint(ansi.bold)}${title}${paintReset()}`,
    "",
    `> ${prefix}${displayValue}`,
    `${paint(ansi.dim)}Enter to run, Esc to cancel${paintReset()}`,
  ])
}

async function runBakeryPromptCommand(input: string, onUpdate: LiveOutputUpdater): Promise<LastActionOutput> {
  const trimmedInput = input.trim()

  if (!trimmedInput) {
    return {
      title: "Bakery command",
      lines: ["No Bakery command entered."],
      success: true,
    }
  }

  const args = splitCommandLine(trimmedInput)
  if (args === null) {
    return {
      title: `brezel bakery ${trimmedInput}`,
      lines: ["Could not parse Bakery command. Check your quotes and try again."],
      success: false,
    }
  }

  return await runBakeryCommandStreaming(`brezel bakery ${trimmedInput}`, args, onUpdate)
}

async function runServeCommandPrompt(input: string, onUpdate: LiveOutputUpdater): Promise<LastActionOutput> {
  const trimmedInput = input.trim()

  if (!trimmedInput) {
    return {
      title: "Brezel command",
      lines: ["No Brezel command entered."],
      success: true,
    }
  }

  const normalizedInput = trimmedInput.startsWith("brezel ") ? trimmedInput.slice("brezel ".length).trim() : trimmedInput
  const args = splitCommandLine(normalizedInput)
  if (args === null) {
    return {
      title: `brezel ${trimmedInput}`,
      lines: ["Could not parse Brezel command. Check your quotes and try again."],
      success: false,
    }
  }

  if (args.length === 0) {
    return {
      title: "Brezel command",
      lines: ["No Brezel command entered."],
      success: true,
    }
  }

  const [commandName] = args
  const metadata = getCommandMetadata(commandName)

  if (!metadata && !["help", "--help", "-h"].includes(commandName)) {
    return {
      title: `brezel ${normalizedInput}`,
      lines: [
        `Unknown brezel command: ${commandName}`,
        "",
        "Run `brezel --help` to see available commands.",
      ],
      success: false,
    }
  }

  if (metadata && !metadata.serveDashboard.allowed) {
    return {
      title: `brezel ${normalizedInput}`,
      lines: [metadata.serveDashboard.reason ?? "That command cannot run inside the serve dashboard."],
      success: false,
    }
  }

  return await runBrezelCommandStreaming(`brezel ${normalizedInput}`, args, onUpdate)
}

async function runApplyCommandCaptured(onUpdate: LiveOutputUpdater): Promise<LastActionOutput> {
  return await runBakeryCommandStreaming("brezel apply", ["apply"], onUpdate)
}

async function runLoadCommandCaptured(onUpdate: LiveOutputUpdater): Promise<LastActionOutput> {
  return await runBakeryCommandStreaming("brezel load", ["load"], onUpdate)
}

async function runUpdateCommandCaptured(onUpdate: LiveOutputUpdater): Promise<LastActionOutput> {
  const steps: Array<{ title: string, args: string[] }> = [
    { title: "migrate --force", args: ["migrate", "--force"] },
    { title: "load", args: ["load"] },
    { title: "apply", args: ["apply"] },
  ]
  const outputSections: string[] = []

  for (const step of steps) {
    let stdout = ""
    let stderr = ""
    const result = await runBakeryArgsStreamingCaptured(step.args, {
      mirrorStdout: false,
      mirrorStderr: false,
      onStdoutChunk: (chunk) => {
        stdout += chunk
        onUpdate("brezel update", buildUpdateOutputLines(outputSections, step.args, stdout, stderr))
      },
      onStderrChunk: (chunk) => {
        stderr += chunk
        onUpdate("brezel update", buildUpdateOutputLines(outputSections, step.args, stdout, stderr))
      },
    })
    const sectionLines = normalizeOutputLines(result.stdout, result.stderr)

    outputSections.push(`$ brezel bakery ${step.args.join(" ")}`)
    if (sectionLines.length > 0) {
      outputSections.push(...sectionLines)
    }

    if (result.exitCode !== 0) {
      return {
        title: "brezel update",
        lines: outputSections,
        success: false,
      }
    }

    outputSections.push("")
  }

  while (outputSections.length > 0 && outputSections[outputSections.length - 1] === "") {
    outputSections.pop()
  }

  return {
    title: "brezel update",
    lines: outputSections.length > 0 ? outputSections : ["Command completed successfully."],
    success: true,
  }
}

async function runBakeryCommandStreaming(title: string, args: string[], onUpdate: LiveOutputUpdater): Promise<LastActionOutput> {
  let stdout = ""
  let stderr = ""

  const result = await runBakeryArgsStreamingCaptured(args, {
    mirrorStdout: false,
    mirrorStderr: false,
    onStdoutChunk: (chunk) => {
      stdout += chunk
      onUpdate(title, normalizeOutputLines(stdout, stderr))
    },
    onStderrChunk: (chunk) => {
      stderr += chunk
      onUpdate(title, normalizeOutputLines(stdout, stderr))
    },
  })

  return buildCommandOutput(title, result.stdout, result.stderr, result.exitCode)
}

async function runBrezelCommandStreaming(title: string, args: string[], onUpdate: LiveOutputUpdater): Promise<LastActionOutput> {
  let stdout = ""
  let stderr = ""

  const result = await runProjectCommandStreamingCaptured({
    unixCommand: "bun",
    windowsCommand: "bun",
    args: ["./bin/brezel.ts", ...args],
  }, {
    mirrorStdout: false,
    mirrorStderr: false,
    onStdoutChunk: (chunk) => {
      stdout += chunk
      onUpdate(title, normalizeOutputLines(stdout, stderr))
    },
    onStderrChunk: (chunk) => {
      stderr += chunk
      onUpdate(title, normalizeOutputLines(stdout, stderr))
    },
  })

  return buildCommandOutput(title, result.stdout, result.stderr, result.exitCode)
}

function buildUpdateOutputLines(outputSections: string[], stepArgs: string[], stdout: string, stderr: string): string[] {
  const lines = [...outputSections, `$ brezel bakery ${stepArgs.join(" ")}`]
  const currentLines = normalizeOutputLines(stdout, stderr)

  if (currentLines.length > 0) {
    lines.push(...currentLines)
  }

  return lines
}

function splitCommandLine(input: string): string[] | null {
  const args: string[] = []
  let current = ""
  let quote: '"' | "'" | null = null

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]

    if (quote) {
      if (character === quote) {
        quote = null
      } else {
        current += character
      }
      continue
    }

    if (character === '"' || character === "'") {
      quote = character
      continue
    }

    if (/\s/.test(character)) {
      if (current.length > 0) {
        args.push(current)
        current = ""
      }
      continue
    }

    current += character
  }

  if (quote) {
    return null
  }

  if (current.length > 0) {
    args.push(current)
  }

  return args
}

async function waitForever(): Promise<number> {
  return await new Promise<number>(() => {
    process.stdin.resume()
  })
}

function commandExists(command: string): boolean {
  const check = process.platform === "win32"
    ? spawnSync("where", [command], { stdio: "ignore" })
    : spawnSync("sh", ["-lc", `command -v ${command}`], { stdio: "ignore" })

  return check.status === 0
}

function showPortConflict(port: number): void {
  console.error(`Port ${port} is already in use.`)

  const dockerPs = spawnSync("docker", ["ps", "--filter", `publish=${port}`, "--format", "Docker: {{.Names}} ({{.Image}}) -> {{.Ports}}"], {
    stdio: ["ignore", "pipe", "ignore"],
    encoding: "utf-8",
  })

  if (dockerPs.status === 0 && dockerPs.stdout.trim().length > 0) {
    process.stderr.write(dockerPs.stdout)
  }

  if (process.platform !== "win32") {
    const ss = spawnSync("sh", ["-lc", `command -v ss >/dev/null 2>&1 && ss -ltnp 'sport = :${port}' || true`], {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf-8",
    })

    if (ss.stdout.trim().length > 0) {
      process.stderr.write(ss.stdout)
    }
  }

  console.error("Stop the process using that port, or stop the other Brezel stack first.")
}
