import { runProjectCommand, runProjectCommandCaptured, runProjectCommandInteractive, runProjectCommandStreamingCaptured, type CapturedCommandResult, type StreamingCaptureOptions } from "./exec"

const optionalProfiles = ["db-explore"]

export function runComposeCommand(args: string[]): number {
  return runProjectCommand({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args: withOptionalProfiles(args),
  })
}

export async function runComposeCommandInteractive(args: string[]): Promise<number> {
  return await runProjectCommandInteractive({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args: withOptionalProfiles(args),
  })
}

export function runComposeCommandCaptured(args: string[]): CapturedCommandResult {
  return runProjectCommandCaptured({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args: withOptionalProfiles(args),
  })
}

export async function runComposeCommandStreamingCaptured(args: string[], options: StreamingCaptureOptions = {}): Promise<CapturedCommandResult> {
  return await runProjectCommandStreamingCaptured({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args: withOptionalProfiles(args),
  }, options)
}

function withOptionalProfiles(args: string[]): string[] {
  return [...optionalProfiles.flatMap((profile) => ["--profile", profile]), ...args]
}
