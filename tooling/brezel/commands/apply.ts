import { runTimedBakerySequence } from "../lib/bakery-actions"
import { assertNoArgs } from "../lib/validation"

export function runApplyCommand(args: string[]): number {
  if (!assertNoArgs("brezel apply", args)) {
    return 1
  }

  return runTimedBakerySequence("brezel apply", [
    { label: "bakery apply...", args: ["apply"] },
  ])
}
