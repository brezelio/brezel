#!/usr/bin/env bun

import { runCli } from "../tooling/brezel/cli"

try {
  const exitCode = await runCli(process.argv.slice(2))
  process.exit(exitCode)
} catch (error) {
  const message = error instanceof Error ? error.stack ?? error.message : String(error)
  console.error("brezel failed unexpectedly.")
  console.error("")
  console.error(message)
  process.exit(1)
}
