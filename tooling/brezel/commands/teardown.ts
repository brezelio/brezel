import { runComposeCommand } from "../lib/compose"
import { assertNoArgs } from "../lib/validation"

export function runTeardownCommand(args: string[]): number {
  if (!assertNoArgs("brezel teardown", args)) {
    return 1
  }

  console.log("Tearing down the local Brezel Docker stack, its volumes, and its local images")
  return runComposeCommand(["down", "-v", "--rmi", "local", "--remove-orphans"], { profiles: ["db-explore"] })
}
