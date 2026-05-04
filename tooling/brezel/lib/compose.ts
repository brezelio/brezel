import { runProjectCommand, runProjectCommandInteractive } from "./exec"

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
