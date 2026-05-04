import { runComposeCommand } from "./compose"

export function runBakeryArgs(args: string[]): number {
  const composeArgs = ["exec"]

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    composeArgs.push("-T")
  }

  composeArgs.push("app", "php", "bakery", ...args)

  return runComposeCommand(composeArgs)
}
