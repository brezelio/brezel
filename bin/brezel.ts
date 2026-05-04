#!/usr/bin/env bun

import { runCli } from "../tooling/brezel/cli"

const exitCode = await runCli(process.argv.slice(2))
process.exit(exitCode)
