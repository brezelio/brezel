import { runProjectCommand, runProjectCommandCaptured, runProjectCommandCapturedAsync, runProjectCommandInteractive, runProjectCommandStreamingCaptured, type CapturedCommandResult, type StreamingCaptureOptions } from "./exec"

type ComposeOptions = {
  profiles?: string[]
}

export function runComposeCommand(args: string[], options: ComposeOptions = {}): number {
  const composeArgs = withProfiles(args, options.profiles)
  return runProjectCommand({
    unixCommand: "bin/compose",
    windowsCommand: "powershell.exe",
    args: composeArgs,
    windowsArgs: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "bin\\compose.ps1", "--%", ...composeArgs],
  })
}

export async function runComposeCommandInteractive(args: string[], options: ComposeOptions = {}): Promise<number> {
  const composeArgs = withProfiles(args, options.profiles)
  return await runProjectCommandInteractive({
    unixCommand: "bin/compose",
    windowsCommand: "powershell.exe",
    args: composeArgs,
    windowsArgs: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "bin\\compose.ps1", "--%", ...composeArgs],
  })
}

export function runComposeCommandCaptured(args: string[], options: ComposeOptions = {}): CapturedCommandResult {
  const composeArgs = withProfiles(args, options.profiles)
  return runProjectCommandCaptured({
    unixCommand: "bin/compose",
    windowsCommand: "powershell.exe",
    args: composeArgs,
    windowsArgs: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "bin\\compose.ps1", "--%", ...composeArgs],
  })
}

export async function runComposeCommandCapturedAsync(args: string[], options: ComposeOptions = {}): Promise<CapturedCommandResult> {
  const composeArgs = withProfiles(args, options.profiles)
  return await runProjectCommandCapturedAsync({
    unixCommand: "bin/compose",
    windowsCommand: "powershell.exe",
    args: composeArgs,
    windowsArgs: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "bin\\compose.ps1", "--%", ...composeArgs],
  })
}

export async function runComposeCommandStreamingCaptured(args: string[], options: StreamingCaptureOptions & ComposeOptions = {}): Promise<CapturedCommandResult> {
  const { profiles, ...streamingOptions } = options
  const composeArgs = withProfiles(args, profiles)

  return await runProjectCommandStreamingCaptured({
    unixCommand: "bin/compose",
    windowsCommand: "powershell.exe",
    args: composeArgs,
    windowsArgs: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "bin\\compose.ps1", "--%", ...composeArgs],
  }, streamingOptions)
}

function withProfiles(args: string[], profiles: string[] = []): string[] {
  return [...profiles.flatMap((profile) => ["--profile", profile]), ...args]
}
