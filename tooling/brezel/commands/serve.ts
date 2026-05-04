import { runProjectCommand } from "../lib/exec"

export function runServeCommand(args: string[]): number {
  if (args.length > 0) {
    console.error("brezel serve does not accept additional arguments yet.")
    return 1
  }

  return runProjectCommand({
    unixCommand: "mise",
    windowsCommand: "mise",
    args: ["run", "serve"],
  })
}
