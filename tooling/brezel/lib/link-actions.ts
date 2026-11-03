import { runComposeCommand, runComposeCommandInteractive } from "./compose"
import type { LinkTarget } from "./links"

type LinkRefreshOptions = {
  installLinkedSpaDependencies?: boolean
}

export async function refreshLinkedTargets(targets: LinkTarget[], options: LinkRefreshOptions = {}): Promise<number> {
  const uniqueTargets = [...new Set(targets)]

  console.log("Restarting the local Brezel stack...")
  if (runComposeCommand(["down", "--remove-orphans"], { profiles: ["db-explore"] }) !== 0) {
    return 1
  }

  if (uniqueTargets.includes("api")) {
    console.log("Refreshing Composer dependencies for the linked API...")
    if (await runComposeCommandInteractive(["run", "--rm", "deps"]) !== 0) {
      return 1
    }
  }

  if (uniqueTargets.includes("spa")) {
    console.log("Refreshing npm dependencies for the linked SPA...")
    if (await runComposeCommandInteractive(["run", "--rm", "node_deps"]) !== 0) {
      return 1
    }

    if (options.installLinkedSpaDependencies) {
      console.log("Installing dependencies inside the linked brezel/spa checkout...")
      if (await runComposeCommandInteractive(["run", "--rm", "node_deps", "sh", "-lc", linkedSpaInstallCommand]) !== 0) {
        return 1
      }
    }
  }

  return runComposeCommand(["up", "-d", "--remove-orphans"])
}

const linkedSpaInstallCommand = `
if [ -n "$NPM_TOKEN" ]; then
  mkdir -p "$HOME"

  npm config set @kibro:registry https://gitlab.kiwis-and-brownies.de/api/v4/packages/npm/
  echo "//gitlab.kiwis-and-brownies.de/api/v4/packages/npm/:_authToken=\${NPM_TOKEN}" >> "$HOME/.npmrc"
  echo "//gitlab.kiwis-and-brownies.de/api/v4/projects/15/packages/npm/:_authToken=\${NPM_TOKEN}" >> "$HOME/.npmrc"
  echo "//gitlab.kiwis-and-brownies.de/api/v4/projects/18/packages/npm/:_authToken=\${NPM_TOKEN}" >> "$HOME/.npmrc"
  echo "//gitlab.kiwis-and-brownies.de/api/v4/projects/19/packages/npm/:_authToken=\${NPM_TOKEN}" >> "$HOME/.npmrc"
  echo "//gitlab.kiwis-and-brownies.de/api/v4/projects/44/packages/npm/:_authToken=\${NPM_TOKEN}" >> "$HOME/.npmrc"
  echo "//gitlab.kiwis-and-brownies.de/api/v4/projects/58/packages/npm/:_authToken=\${NPM_TOKEN}" >> "$HOME/.npmrc"
fi

npm install --prefix /linked/spa
`.trim()
