import { spawnSync } from "node:child_process"
import { join } from "node:path"
import { emitKeypressEvents } from "node:readline"
import { runComposeCommand as runCompose } from "../lib/compose"
import { runBakeryArgsStreamingCaptured } from "../lib/bakery"
import { getProjectEnvValue } from "../lib/env"
import { getProjectDir, runProjectCommandInteractive } from "../lib/exec"
import { runLogsCommand } from "./logs"
import { portIsBusy } from "../lib/ports"

const ports = [2040, 2041, 2042, 2043]
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

export async function runServeCommand(args: string[]): Promise<number> {
  let interactive = false
  let rebuild = false
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

    console.error("Usage: brezel serve [interactive] [--rebuild]")
    return 1
  }

  if (interactive && !commandExists("zellij")) {
    console.error("zellij is required for brezel serve but was not found in PATH.")
    return 1
  }

  console.log("Cleaning up any existing Docker stack for this project")
  runCompose(["down", "--remove-orphans"])

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

  printServeEndpoints(appSystem)

  let cleanedUp = false
  let inForegroundAction = false

  const cleanup = () => {
    if (cleanedUp) {
      return
    }

    cleanedUp = true
    runCompose(["down", "--remove-orphans"])
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

type LastActionOutput = {
  title: string
  lines: string[]
  success: boolean
  live?: boolean
}

type BakeryPromptState = {
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
  let lastActionOutput: LastActionOutput | null = null
  let liveActionOutput: LastActionOutput | null = null
  let bakeryPrompt: BakeryPromptState | null = null

  const render = () => renderServeControlScreen(appSystem, showHelp, shimmerFrame, liveActionOutput ?? lastActionOutput, bakeryPrompt)
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

  const runAction = async (action: () => Promise<number> | number, expectedExitCodes: number[] = [0]) => {
    busy = true
    context.setForegroundAction(true)
    stopShimmer()
    disableRawMode()

    try {
      console.log("")
      const exitCode = await action()
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

    if (bakeryPrompt) {
      if (key.ctrl && key.name === "c") {
        bakeryPrompt = null
        render()
        return
      }

      switch (key.name) {
        case "escape":
          bakeryPrompt = null
          render()
          return
        case "return":
        case "enter": {
          const command = bakeryPrompt.value
          bakeryPrompt = null
          await runCapturedAction(() => runBakeryPromptCommand(command, updateLiveActionOutput))
          return
        }
        case "backspace":
          bakeryPrompt.value = bakeryPrompt.value.slice(0, -1)
          render()
          return
        default:
          if (_str && isPrintableInput(_str)) {
            bakeryPrompt.value += _str
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
        bakeryPrompt = { value: "" }
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

  return await new Promise<number>((resolve) => {
    resolveExit = resolve
  })
}

function renderServeControlScreen(appSystem: string, showHelp: boolean, shimmerFrame: number, lastActionOutput: LastActionOutput | null, bakeryPrompt: BakeryPromptState | null): void {
  console.clear()
  console.log("")
  console.log("")
  const statusLabel = showHelp ? "help: visible" : "help: hidden"
  for (const line of brezelLogo.map((entry, index) => renderLogoLine(entry, index, shimmerFrame))) {
    console.log(centerLine(line))
  }

  console.log("")
  for (const line of renderInlineBox(`${paint(ansi.bold, ansi.green)}Brezel is running${paintReset()}`)) {
    console.log(centerLine(line))
  }

  console.log("\n")
  console.log(centerLine(statusLine(["stack: running", statusLabel])))
  console.log("")
  console.log(centerLine(`${paint(ansi.bold)}${renderServeEndpointLine(appSystem)}${paintReset()}`))
  console.log("\n")

  if (showHelp) {
    console.log(
      centerLine(
        `${paint(ansi.dim)}Actions:${paintReset()} ` +
        `${hotkey("b")} bakery   ${hotkey("u")} update   ${hotkey("a")} apply   ${hotkey("l")} load   ` +
        `${hotkey("p")} peek   ${hotkey("j")} jobs   ${hotkey("q")} quit   ${hotkey("h")} hide help`
      )
    )
  } else {
    console.log(centerLine(`${paint(ansi.dim)}Press ${hotkey("h")} for controls, ${hotkey("q")} or ${hotkey("Ctrl+C")} to stop Brezel.${paintReset()}`))
  }

  if (bakeryPrompt) {
    console.log("")
    for (const line of renderBakeryPromptBlock(bakeryPrompt)) {
      console.log(centerLine(line))
    }
  }

  if (lastActionOutput) {
    console.log("")
    for (const line of renderOutputBlock(lastActionOutput)) {
      console.log(centerLine(line))
    }
  }

  console.log("")
}

function hotkey(key: string): string {
  return `${paint(ansi.bold, ansi.cyan)}[${key}]${paintReset()}`
}

function statusLine(parts: string[]): string {
  return `${paint(ansi.dim)}${parts.join("  |  ")}${paintReset()}`
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

  const leftPadding = Math.floor((terminalWidth - visibleLength) / 2)
  return `${" ".repeat(leftPadding)}${line}`
}

function renderInlineBox(line: string): string[] {
  return renderInlineBoxLines([line])
}

function renderBakeryPromptBlock(prompt: BakeryPromptState): string[] {
  const displayValue = prompt.value.length > 0 ? prompt.value : `${paint(ansi.dim)}type a bakery command...${paintReset()}`
  return renderInlineBoxLines([
    `${paint(ansi.bold)}Bakery command${paintReset()}`,
    "",
    `brezel bakery ${displayValue}`,
    `${paint(ansi.dim)}Enter to run, Esc to cancel${paintReset()}`,
  ])
}

function padVisible(line: string, width: number): string {
  const visibleLength = stripAnsi(line).length
  if (visibleLength >= width) {
    return line
  }

  return `${line}${" ".repeat(width - visibleLength)}`
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

  return buildLastActionOutput(title, result.stdout, result.stderr, result.exitCode)
}

function buildUpdateOutputLines(outputSections: string[], stepArgs: string[], stdout: string, stderr: string): string[] {
  const lines = [...outputSections, `$ brezel bakery ${stepArgs.join(" ")}`]
  const currentLines = normalizeOutputLines(stdout, stderr)

  if (currentLines.length > 0) {
    lines.push(...currentLines)
  }

  return lines
}

function buildLastActionOutput(title: string, stdout: string, stderr: string, exitCode: number): LastActionOutput {
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

  return combined
    .split(/\r?\n/)
    .map((line) => stripAnsi(line))
}

function renderOutputBlock(output: LastActionOutput): string[] {
  const maxLines = 10
  const lines = output.lines.length > maxLines
    ? [
        `... showing last ${maxLines} lines of ${output.lines.length}`,
        ...output.lines.slice(-maxLines),
      ]
    : output.lines

  const header = `${output.success ? paint(ansi.green, ansi.bold) : paint(ansi.yellow, ansi.bold)}Last output:${paintReset()} ${output.title}`
  return renderInlineBoxLines([header, "", ...lines])
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

function isPrintableInput(value: string): boolean {
  return !/[\u0000-\u001f\u007f]/.test(value)
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
