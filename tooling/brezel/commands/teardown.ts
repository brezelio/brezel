import { runComposeCommand } from "../lib/compose"

export function runTeardownCommand(args: string[]): number {
  if (args.length > 0) {
    console.error("brezel teardown does not accept additional arguments.")
    return 1
  }

  console.log("Tearing down the local Brezel Docker stack, its volumes, and its local images")
  return runComposeCommand(["down", "-v", "--rmi", "local", "--remove-orphans"])
}
