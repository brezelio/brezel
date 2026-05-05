import { createInterface } from "node:readline"
import { runComposeCommand } from "../lib/compose"

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
  return runComposeCommand(["down", "-v", "--rmi", "local", "--remove-orphans"], { profiles: ["db-explore"] })
}

async function confirmTeardown(): Promise<boolean> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return await new Promise<boolean>((resolve) => {
    readline.question("This will remove Brezel containers, volumes, and local images. Continue? [y/N] ", (answer) => {
      readline.close()
      resolve(["y", "yes"].includes(answer.trim().toLowerCase()))
    })
  })
}
