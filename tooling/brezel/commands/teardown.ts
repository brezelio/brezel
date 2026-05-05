import { runComposeCommand } from "../lib/compose"

export function runTeardownCommand(args: string[]): number {
  if (args.length > 0) {
    console.error("brezel teardown does not accept additional arguments.")
    return 1
  }

  console.log("Tearing down the local Brezel Docker stack and its volumes")
  return runComposeCommand(["down", "-v", "--remove-orphans"])
}
