import { refreshLinkedTargets } from "../lib/link-actions"
import { readLinkState, type LinkTarget, validateLinkPath, writeLinkState } from "../lib/links"
import { askChoice, askQuestion } from "../lib/questions"
import { assertInteractiveTerminal, assertNoArgs } from "../lib/validation"

export async function runLinkCommand(args: string[]): Promise<number> {
  if (!assertNoArgs("brezel link", args)) {
    return 1
  }

  if (!assertInteractiveTerminal("brezel link")) {
    return 1
  }

  const target = await askChoice<LinkTarget>("What do you want to link?", [
    { value: "api", label: "brezel/api" },
    { value: "spa", label: "brezel/spa" },
  ])
  if (target === null) {
    return 130
  }
  const currentState = readLinkState()

  while (true) {
    const path = await askQuestion(`Enter the absolute path to the local brezel/${target} repo: `)
    if (path === null) {
      return 130
    }
    const validationError = validateLinkPath(target, path)
    if (validationError) {
      console.error(validationError)
      continue
    }

    currentState[target] = path.trim()
    writeLinkState(currentState)
    console.log(`Linked brezel/${target} from ${path.trim()}`)
    return await refreshLinkedTargets([target], {
      installLinkedSpaDependencies: target === "spa",
    })
  }
}
