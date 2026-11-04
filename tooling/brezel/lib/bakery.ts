import { runComposeCommand, runComposeCommandCaptured, runComposeCommandStreamingCaptured } from "./compose"
import type { CapturedCommandResult, StreamingCaptureOptions } from "./exec"

let appEnsured = false

/**
 * Bakery runs via `compose exec app`, which fails on a stopped stack. Start just the app container
 * (and its dependencies such as the database) on demand, so commands also work from a stopped state.
 */
export function ensureAppRunning(): number {
  if (appEnsured) {
    return 0
  }

  const status = runComposeCommandCaptured(["ps", "--status", "running", "--quiet", "app"])
  if (status.exitCode === 0 && status.stdout.trim().length > 0) {
    appEnsured = true
    return 0
  }

  console.log("Starting database and app container...")
  const exitCode = runComposeCommand(["up", "-d", "--wait", "mariadb", "app"])
  appEnsured = exitCode === 0
  return exitCode
}

export function runBakeryArgs(args: string[]): number {
  const exitCode = ensureAppRunning()
  if (exitCode !== 0) {
    return exitCode
  }

  return runComposeCommand(getBakeryComposeArgs(args))
}

export function runBakeryArgsCaptured(args: string[]): CapturedCommandResult {
  const exitCode = ensureAppRunning()
  if (exitCode !== 0) {
    return { exitCode, stdout: "", stderr: "Could not start the app container." }
  }

  return runComposeCommandCaptured(getBakeryComposeArgs(args))
}

export async function runBakeryArgsStreamingCaptured(args: string[], options: StreamingCaptureOptions = {}): Promise<CapturedCommandResult> {
  const exitCode = ensureAppRunning()
  if (exitCode !== 0) {
    return { exitCode, stdout: "", stderr: "Could not start the app container." }
  }

  return await runComposeCommandStreamingCaptured(getBakeryComposeArgs(args), options)
}

function getBakeryComposeArgs(args: string[]): string[] {
  const composeArgs = ["exec"]

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    composeArgs.push("-T")
  }

  composeArgs.push("app", "php", "bakery", ...args)

  return composeArgs
}
