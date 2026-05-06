import { refreshLinkedTargets } from "../lib/link-actions"
import { readLinkState, type LinkTarget, writeLinkState } from "../lib/links"
import { askChoice } from "../lib/questions"
import { assertInteractiveTerminal } from "../lib/validation"

type UnlinkTarget = LinkTarget | "both"

export async function runUnlinkCommand(args: string[]): Promise<number> {
  if (args.length > 1 || (args.length === 1 && !["api", "spa", "all", "both"].includes(args[0]))) {
    console.error("Usage: brezel unlink [api|spa|all]")
    return 1
  }

  const hasExplicitTarget = args.length === 1

  if (!hasExplicitTarget && !assertInteractiveTerminal("brezel unlink")) {
    return 1
  }

  const currentState = readLinkState()
  if (!currentState.api && !currentState.spa) {
    console.log("No local Brezel links are currently active.")
    return 0
  }

  const choices: Array<{ value: UnlinkTarget, label: string }> = []
  if (currentState.api) {
    choices.push({ value: "api", label: "brezel/api" })
  }
  if (currentState.spa) {
    choices.push({ value: "spa", label: "brezel/spa" })
  }
  if (choices.length > 1) {
    choices.push({ value: "both", label: "both" })
  }

  const target = hasExplicitTarget
    ? ((args[0] === "all" ? "both" : args[0]) as UnlinkTarget)
    : await askChoice<UnlinkTarget>("What do you want to unlink?", choices)
  if (target === null) {
    return 130
  }
  const affectedTargets: LinkTarget[] = []

  if (target === "both") {
    if (currentState.api) {
      affectedTargets.push("api")
    }
    if (currentState.spa) {
      affectedTargets.push("spa")
    }
    delete currentState.api
    delete currentState.spa
  } else {
    affectedTargets.push(target)
    delete currentState[target]
  }

  writeLinkState(currentState)
  console.log("Updated local Brezel links.")
  return await refreshLinkedTargets(affectedTargets)
}
