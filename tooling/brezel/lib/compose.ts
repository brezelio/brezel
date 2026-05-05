import { runProjectCommand, runProjectCommandCaptured, runProjectCommandInteractive, runProjectCommandStreamingCaptured, type CapturedCommandResult, type StreamingCaptureOptions } from "./exec"

export function runComposeCommand(args: string[]): number {
  return runProjectCommand({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args,
  })
}

export async function runComposeCommandInteractive(args: string[]): Promise<number> {
  return await runProjectCommandInteractive({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args,
  })
}

export function runComposeCommandCaptured(args: string[]): CapturedCommandResult {
  return runProjectCommandCaptured({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args,
  })
}

export async function runComposeCommandStreamingCaptured(args: string[], options: StreamingCaptureOptions = {}): Promise<CapturedCommandResult> {
  return await runProjectCommandStreamingCaptured({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args,
  }, options)
}
