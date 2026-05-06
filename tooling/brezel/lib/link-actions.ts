import { runComposeCommand, runComposeCommandInteractive } from "./compose"
import type { LinkTarget } from "./links"

export async function refreshLinkedTargets(targets: LinkTarget[]): Promise<number> {
  const uniqueTargets = [...new Set(targets)]

  console.log("Restarting the local Brezel stack...")
  if (runComposeCommand(["down", "--remove-orphans"], { profiles: ["db-explore"] }) !== 0) {
    return 1
  }

  if (uniqueTargets.includes("api")) {
    console.log("Refreshing Composer dependencies for the linked API...")
    if (await runComposeCommandInteractive(["run", "--rm", "deps"]) !== 0) {
      return 1
    }
  }

  if (uniqueTargets.includes("spa")) {
    console.log("Refreshing npm dependencies for the linked SPA...")
    if (await runComposeCommandInteractive(["run", "--rm", "node_deps"]) !== 0) {
      return 1
    }
  }

  return runComposeCommand(["up", "-d", "--remove-orphans"])
}
