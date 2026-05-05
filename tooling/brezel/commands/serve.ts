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
    disableRawMode()
    process.stdin.removeListener("keypress", onKeypress)
    process.stdin.pause()
  }

  const runAction = async (action: () => Promise<number> | number, expectedExitCodes: number[] = [0]) => {
    busy = true
    context.setForegroundAction(true)
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
        renderServeControlScreen(appSystem)
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
  renderServeControlScreen(appSystem)

  return await new Promise<number>((resolve) => {
    resolveExit = resolve
  })
}

function renderServeControlScreen(appSystem: string): void {
  console.clear()
  console.log("Brezel is running")
  console.log("")
  console.log(`Access it here: http://${appSystem}.brezel.localhost:2040`)
  console.log("API: http://localhost:2041")
  console.log("")
  console.log("Controls")
  console.log("  b  run an arbitrary bakery command")
  console.log("  u  full update")
  console.log("  a  apply config changes")
  console.log("  l  load workflow changes")
  console.log("  d  diagnostics (all container logs)")
  console.log("  j  jobs (workers container logs)")
  console.log("  q  stop Brezel and clean up")
  console.log("  Ctrl+C  stop Brezel and clean up")
  console.log("")
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
