import { runTimedBakerySequence } from "../lib/bakery-actions"
import { assertNoArgs } from "../lib/validation"

export function runLoadCommand(args: string[]): number {
  if (!assertNoArgs("brezel load", args)) {
    return 1
  }

  return runTimedBakerySequence("brezel load", [
    { label: "bakery load...", args: ["load"] },
  ])
}
