import { runTimedBakerySequence } from "../lib/bakery-actions"
import { assertNoArgs } from "../lib/validation"

export function runUpdateCommand(args: string[]): number {
  if (!assertNoArgs("brezel update", args)) {
    return 1
  }

  return runTimedBakerySequence("brezel update", [
    { label: "bakery migrations...", args: ["migrate", "--force"] },
    { label: "bakery load...", args: ["load"] },
    { label: "bakery apply...", args: ["apply"] },
  ])
}
