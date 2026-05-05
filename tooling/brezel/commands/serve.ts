import { spawnSync } from "node:child_process"
import { join } from "node:path"
import { createInterface, emitKeypressEvents } from "node:readline"
import { runComposeCommand as runCompose } from "../lib/compose"
import { runApplyCommand } from "./apply"
import { runBakeryArgs } from "../lib/bakery"
import { getProjectEnvValue } from "../lib/env"
import { getProjectDir, runProjectCommandInteractive } from "../lib/exec"
import { runLoadCommand } from "./load"
import { runLogsCommand } from "./logs"
import { portIsBusy } from "../lib/ports"
import { runUpdateCommand } from "./update"

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
  "%%%%%%%#       *,,,,,,,,*****  ",
  "#%%%%%%#         ,,,,,,,*******",
  "####%%%#             ,,,*******",
  "#######%#             ,&/******",
  "#######%%%%%.      &&&&@@@@#***",
  "#######%%%%%%%%*&&&&&&&@@@@@@@#",
  "  ,####%%%%%%%%&&&&&&&&@@@@@%  ",
  "      /%%%%%%%%&&&&&&&&@%.     ",
  "         ,%%%%%&&&&&&*         ",
]
const maxLogoWidth = Math.max(...brezelLogo.map((line) => line.length))

export async function runServeCommand(args: string[]): Promise<number> {
  const interactive = args[0] === "interactive"
  const appSystem = getProjectEnvValue("APP_SYSTEM") || "example"

  if (args.length > 1 || (args.length === 1 && !interactive)) {
    console.error("Usage: brezel serve [interactive]")
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

  process.once("SIGINT", handleSignal)
  process.once("SIGTERM", handleSignal)
  process.once("SIGHUP", handleSignal)

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
  console.log("")
  console.log(`Brezel is available at http://${appSystem}.brezel.localhost:2040`)
  console.log("API is available at http://localhost:2041")
  console.log("")
}

type ServeControlContext = {
  setForegroundAction: (value: boolean) => void
  stop: () => void
}

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
      renderServeControlScreen(appSystem, showHelp, shimmerFrame)
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
        renderServeControlScreen(appSystem, showHelp, shimmerFrame)
        startShimmer()
      }
      busy = false
    }
  }

  const onKeypress = async (_str: string, key: { ctrl?: boolean, name?: string }) => {
    if (busy) {
      return
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
        renderServeControlScreen(appSystem, showHelp, shimmerFrame)
        return
      case "b":
        await runAction(() => promptAndRunBakeryCommand())
        return
      case "u":
        await runAction(() => runUpdateCommand([]))
        return
      case "a":
        await runAction(() => runApplyCommand([]))
        return
      case "l":
        await runAction(() => runLoadCommand([]))
        return
      case "d":
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
  renderServeControlScreen(appSystem, showHelp, shimmerFrame)
  startShimmer()

  return await new Promise<number>((resolve) => {
    resolveExit = resolve
  })
}

function renderServeControlScreen(appSystem: string, showHelp: boolean, shimmerFrame: number): void {
  console.clear()
  const statusLabel = showHelp ? "help: visible" : "help: hidden"
  for (const line of brezelLogo.map((entry, index) => renderLogoLine(entry, index, shimmerFrame))) {
    console.log(centerLine(line))
  }

  console.log("")
  for (const line of renderInlineBox(`${paint(ansi.bold, ansi.green)}Brezel is running${paintReset()}`)) {
    console.log(centerLine(line))
  }

  console.log("")
  console.log(centerLine(statusLine(["stack: running", "mode: foreground", statusLabel])))
  console.log(centerLine(`${paint(ansi.bold)}Access it here:${paintReset()} http://${appSystem}.brezel.localhost:2040`))
  console.log(centerLine(`${paint(ansi.dim)}API:${paintReset()} http://localhost:2041`))
  console.log("")

  if (showHelp) {
    console.log(
      centerLine(
        `${paint(ansi.dim)}Actions:${paintReset()} ` +
        `${hotkey("b")} bakery   ${hotkey("u")} update   ${hotkey("a")} apply   ${hotkey("l")} load   ` +
        `${hotkey("d")} diagnostics   ${hotkey("j")} jobs   ${hotkey("q")} quit   ${hotkey("h")} hide help`,
      ),
    )
  } else {
    console.log(centerLine(`${paint(ansi.dim)}Press ${hotkey("h")} for controls, ${hotkey("q")} to stop Brezel.${paintReset()}`))
  }

  console.log("")
  console.log(centerLine(`${paint(ansi.dim)}Normal stop:${paintReset()} Ctrl+C`))
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
  const visibleWidth = stripAnsi(line).length
  const horizontal = "─".repeat(visibleWidth + 2)

  return [
    `${paint(ansi.dim)}┌${horizontal}┐${paintReset()}`,
    `${paint(ansi.dim)}│ ${paintReset()}${line}${paint(ansi.dim)} │${paintReset()}`,
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

async function promptAndRunBakeryCommand(): Promise<number> {
  const input = await promptLine("brezel bakery ")
  const trimmedInput = input.trim()

  if (!trimmedInput) {
    return 0
  }

  const args = splitCommandLine(trimmedInput)
  if (args === null) {
    console.error("Could not parse bakery command. Check your quotes and try again.")
    return 1
  }

  console.log(`Running: brezel bakery ${trimmedInput}`)
  return runBakeryArgs(args)
}

async function promptLine(prompt: string): Promise<string> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return await new Promise<string>((resolve) => {
    readline.question(prompt, (answer) => {
      readline.close()
      resolve(answer)
    })
  })
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
