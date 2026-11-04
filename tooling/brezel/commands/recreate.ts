import { runTimedBakerySequence } from "../lib/bakery-actions"
import { runBakeryArgsCaptured } from "../lib/bakery"
import { askYesNo } from "../lib/questions"
import { getSingleSystemIdentifier } from "../lib/system-config"

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

  const list = runBakeryArgsCaptured(["system", "list", "--ignored"])
  if (list.exitCode !== 0) {
    console.error(list.stderr.trim() || list.stdout.trim())
    console.error("Could not list existing systems. If the database was torn down, run `brezel setup` instead.")
    return list.exitCode
  }

  // `bakery system delete` crashes on a missing system, so skip it to allow re-running after a failed recreate.
  const exists = new RegExp(`^\\|\\s*${identifier}\\s*\\|`, "m").test(list.stdout)
  const deleteSteps = exists
    ? [{ label: `bakery system delete ${identifier}...`, args: ["system", "delete", identifier] }]
    : []

  return runTimedBakerySequence("brezel recreate", [
    ...deleteSteps,
    { label: `bakery system create ${identifier}...`, args: ["system", "create", identifier] },
    { label: "bakery migrations...", args: ["migrate", "--force"] },
    { label: "bakery load...", args: ["load"] },
    // Mirrors `brezel setup`, which applies twice on a fresh system.
    { label: "bakery apply (step 1)...", args: ["apply"] },
    { label: "bakery apply (step 2)...", args: ["apply"] },
    { label: "bakery queue:restart...", args: ["queue:restart"] },
  ])
}
