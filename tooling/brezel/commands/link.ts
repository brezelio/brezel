import { refreshLinkedTargets } from "../lib/link-actions"
import { readLinkState, type LinkTarget, validateLinkPath, writeLinkState } from "../lib/links"
import { askChoice, askQuestion } from "../lib/questions"
import { assertInteractiveTerminal } from "../lib/validation"

const linkTargets: LinkTarget[] = ["api", "spa"]

export async function runLinkCommand(args: string[]): Promise<number> {
  if (args.length > 1 || (args.length === 1 && !linkTargets.includes(args[0] as LinkTarget))) {
    console.error("Usage: brezel link [api|spa]")
    return 1
  }

  const currentState = readLinkState()
  let target = args[0] as LinkTarget | undefined

  if (!target) {
    printLinkOverview(currentState)

    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      return 0
    }

    const choice = await askChoice<LinkTarget>("What do you want to link?", [
      { value: "api", label: "brezel/api" },
      { value: "spa", label: "brezel/spa" },
    ])
    if (choice === null) {
      return 130
    }
    target = choice
  }

  if (!assertInteractiveTerminal("brezel link")) {
    return 1
  }

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

function printLinkOverview(state: Partial<Record<LinkTarget, string>>): void {
  console.log(`brezel link mounts a local brezel/api or brezel/spa checkout into the Docker stack,
so changes in that checkout take effect here without publishing a package.

  api  replaces vendor/brezel/api in the app, workers, and scheduler containers
  spa  replaces @kibro/brezel-spa for the node_deps and vite containers

Linking a target that is already linked replaces its path.
Run \`brezel link api\` or \`brezel link spa\` to skip this overview, \`brezel unlink\` to remove links.

Current links:
  api  ${state.api ?? "not linked"}
  spa  ${state.spa ?? "not linked"}
`)
}
