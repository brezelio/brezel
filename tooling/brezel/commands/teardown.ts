import { existsSync, rmSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"
import { runComposeCommand } from "../lib/compose"
import { getProjectDir } from "../lib/exec"

export async function runTeardownCommand(args: string[]): Promise<number> {
  const force = args.includes("--force")

  if (args.length > 1 || (args.length === 1 && !force)) {
    console.error("Usage: brezel teardown [--force]")
    return 1
  }

  if (!force && process.stdin.isTTY && process.stdout.isTTY) {
    const confirmed = await confirmTeardown()
    if (!confirmed) {
      console.log("Cancelled.")
      return 1
    }
  } else if (!force) {
    console.error("brezel teardown requires confirmation in an interactive terminal. Use --force to skip the prompt.")
    return 1
  }

  console.log("Tearing down the local Brezel Docker stack, its volumes, and its local images")
  const exitCode = runComposeCommand(["down", "-v", "--rmi", "local", "--remove-orphans"], { profiles: ["db-explore"] })

  if (exitCode === 0) {
    cleanupLocalBrezelState()
  }

  return exitCode
}

async function confirmTeardown(): Promise<boolean> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return await new Promise<boolean>((resolve) => {
    readline.question("This will remove Brezel containers, volumes, and local images, aka. DELETE ALL YOUR DATA! Continue? [y/N] ", (answer) => {
      readline.close()
      resolve(["y", "yes"].includes(answer.trim().toLowerCase()))
    })
  })
}

function cleanupLocalBrezelState(): void {
  const stateDir = join(getProjectDir(), ".brezel-state")

  if (existsSync(stateDir)) {
    rmSync(stateDir, { recursive: true, force: true })
  }
}
