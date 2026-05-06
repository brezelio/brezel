import { refreshLinkedTargets } from "../lib/link-actions"
import { readLinkState, type LinkTarget, writeLinkState } from "../lib/links"
import { askChoice } from "../lib/questions"
import { assertInteractiveTerminal, assertNoArgs } from "../lib/validation"

type UnlinkTarget = LinkTarget | "both"

export async function runUnlinkCommand(args: string[]): Promise<number> {
  if (!assertNoArgs("brezel unlink", args)) {
    return 1
  }

  if (!assertInteractiveTerminal("brezel unlink")) {
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

  const target = await askChoice<UnlinkTarget>("What do you want to unlink?", choices)
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
