import { runProjectCommand } from "../lib/exec"

export function runBakeryCommand(args: string[]): number {
  const composeArgs = ["exec"]

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    composeArgs.push("-T")
  }

  composeArgs.push("app", "php", "bakery", ...args)

  return runProjectCommand({
    unixCommand: "bin/compose",
    windowsCommand: "bin\\compose.bat",
    args: composeArgs,
  })
}
