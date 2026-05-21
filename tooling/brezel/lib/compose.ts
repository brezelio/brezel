import { runProjectCommand, runProjectCommandCaptured, runProjectCommandCapturedAsync, runProjectCommandInteractive, runProjectCommandStreamingCaptured, type CapturedCommandResult, type StreamingCaptureOptions } from "./exec"

type ComposeOptions = {
  profiles?: string[]
}

export function runComposeCommand(args: string[], options: ComposeOptions = {}): number {
  return runProjectCommand({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args: withProfiles(args, options.profiles),
  })
}

export async function runComposeCommandInteractive(args: string[], options: ComposeOptions = {}): Promise<number> {
  return await runProjectCommandInteractive({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args: withProfiles(args, options.profiles),
  })
}

export function runComposeCommandCaptured(args: string[], options: ComposeOptions = {}): CapturedCommandResult {
  return runProjectCommandCaptured({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args: withProfiles(args, options.profiles),
  })
}

export async function runComposeCommandCapturedAsync(args: string[], options: ComposeOptions = {}): Promise<CapturedCommandResult> {
  return await runProjectCommandCapturedAsync({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args: withProfiles(args, options.profiles),
  })
}

export async function runComposeCommandStreamingCaptured(args: string[], options: StreamingCaptureOptions & ComposeOptions = {}): Promise<CapturedCommandResult> {
  const { profiles, ...streamingOptions } = options

  return await runProjectCommandStreamingCaptured({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args: withProfiles(args, profiles),
  }, streamingOptions)
}

function withProfiles(args: string[], profiles: string[] = []): string[] {
  return [...profiles.flatMap((profile) => ["--profile", profile]), ...args]
}
