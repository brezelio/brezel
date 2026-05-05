import { runComposeCommandInteractive } from "../lib/compose"

export async function runAttachCommand(args: string[]): Promise<number> {
  if (args.length > 0) {
    console.error("brezel attach does not accept additional arguments.")
    return 1
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error("brezel attach requires an interactive terminal.")
    return 1
  }

  return await runComposeCommandInteractive([
    "exec",
    "app",
    "sh",
    "-lc",
    "if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi",
  ])
}
