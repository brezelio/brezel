import { spawnSync } from "node:child_process"
import { join } from "node:path"
import { getProjectDir, runProjectCommand, runProjectCommandInteractive } from "../lib/exec"
import { portIsBusy } from "../lib/ports"

const ports = [2040, 2041, 2042, 2043]

export async function runServeCommand(args: string[]): Promise<number> {
  if (args.length > 0) {
    console.error("brezel serve does not accept additional arguments yet.")
    return 1
  }

  if (!commandExists("zellij")) {
    console.error("zellij is required for brezel serve but was not found in PATH.")
    return 1
  }

  console.log("Cleaning up any existing Docker stack for this project")
  runComposeCommand(["down", "--remove-orphans"])

  for (const port of ports) {
    if (await portIsBusy(port)) {
      showPortConflict(port)
      return 1
    }
  }

  console.log("Starting brezel using Docker Compose and Zellij")
  const upExitCode = runComposeCommand(["up", "-d", "--remove-orphans"])
  if (upExitCode !== 0) {
    return upExitCode
  }

  let cleanedUp = false

  const cleanup = () => {
    if (cleanedUp) {
      return
    }

    cleanedUp = true
    runComposeCommand(["down", "--remove-orphans"])
  }

  const handleSignal = (signal: NodeJS.Signals) => {
    cleanup()
    process.exit(128)
  }

  process.once("SIGINT", handleSignal)
  process.once("SIGTERM", handleSignal)
  process.once("SIGHUP", handleSignal)

  const layoutPath = join(getProjectDir(), "bin", "assets", "zellij", "layout.kdl")
  const zellijExitCode = await runProjectCommandInteractive({
    unixCommand: "zellij",
    windowsCommand: "zellij",
    args: ["--layout", layoutPath],
  })

  process.removeListener("SIGINT", handleSignal)
  process.removeListener("SIGTERM", handleSignal)
  process.removeListener("SIGHUP", handleSignal)

  cleanup()
  return zellijExitCode
}

function commandExists(command: string): boolean {
  const check = process.platform === "win32"
    ? spawnSync("where", [command], { stdio: "ignore" })
    : spawnSync("sh", ["-lc", `command -v ${command}`], { stdio: "ignore" })

  return check.status === 0
}

function runComposeCommand(args: string[]): number {
  return runProjectCommand({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args,
  })
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
