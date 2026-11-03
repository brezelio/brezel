import { runComposeCommandInteractive } from "../lib/compose"
import { assertInteractiveTerminal, assertNoArgs } from "../lib/validation"

export async function runAttachCommand(args: string[]): Promise<number> {
  if (!assertNoArgs("brezel attach", args)) {
    return 1
  }

  if (!assertInteractiveTerminal("brezel attach")) {
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
