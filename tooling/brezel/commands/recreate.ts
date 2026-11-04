import { runTimedBakerySequence } from "../lib/bakery-actions"
import { runComposeCommand, runComposeCommandCaptured } from "../lib/compose"
import { askYesNo } from "../lib/questions"
import { getSingleSystemIdentifier } from "../lib/system-config"

const backgroundServices = ["workers", "scheduler"]

export async function runRecreateCommand(args: string[]): Promise<number> {
  const force = args.includes("--force")

  if (args.length > 1 || (args.length === 1 && !force)) {
    console.error("Usage: brezel recreate [--force]")
    return 1
  }

  const identifier = getSingleSystemIdentifier()

  if (!force && process.stdin.isTTY && process.stdout.isTTY) {
    const confirmed = await askYesNo(`This will delete system '${identifier}' including its database, aka. DELETE ALL ITS DATA! Continue?`, false)
    if (!confirmed) {
      console.log("Cancelled.")
      return 1
    }
  } else if (!force) {
    console.error("brezel recreate requires confirmation in an interactive terminal. Use --force to skip the prompt.")
    return 1
  }

  // Workers and the scheduler would hit the database while it is being wiped.
  const runningServices = runComposeCommandCaptured(["ps", "--status", "running", "--services", ...backgroundServices])
    .stdout.split("\n").map((line) => line.trim()).filter(Boolean)
  if (runningServices.length > 0) {
    console.log(`Stopping ${runningServices.join(", ")}...`)
    runComposeCommand(["stop", ...runningServices])
  }

  const exitCode = runTimedBakerySequence("brezel recreate", [
    { label: `bakery system delete ${identifier}...`, args: ["system", "delete", identifier, "--force"] },
    { label: `bakery system create ${identifier}...`, args: ["system", "create", identifier] },
    { label: "bakery migrations...", args: ["migrate", "--force"] },
    { label: "bakery load...", args: ["load"] },
    // Mirrors `brezel setup`, which applies twice on a fresh system.
    { label: "bakery apply (step 1)...", args: ["apply"] },
    { label: "bakery apply (step 2)...", args: ["apply"] },
  ])

  if (runningServices.length > 0) {
    console.log(`Starting ${runningServices.join(", ")} again...`)
    runComposeCommand(["up", "-d", ...runningServices])
  }

  return exitCode
}
