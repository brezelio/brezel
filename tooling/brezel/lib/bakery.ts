import { runComposeCommand, runComposeCommandCaptured, runComposeCommandStreamingCaptured } from "./compose"
import type { CapturedCommandResult, StreamingCaptureOptions } from "./exec"

export function runBakeryArgs(args: string[]): number {
  return runComposeCommand(getBakeryComposeArgs(args))
}

export function runBakeryArgsCaptured(args: string[]): CapturedCommandResult {
  return runComposeCommandCaptured(getBakeryComposeArgs(args))
}

export async function runBakeryArgsStreamingCaptured(args: string[], options: StreamingCaptureOptions = {}): Promise<CapturedCommandResult> {
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
