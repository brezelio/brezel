import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"
import { runComposeCommand, runComposeCommandInteractive } from "../lib/compose"
import { ensureProjectEnvFile, readEnvValue, writeEnvValue } from "../lib/env"
import { getProjectDir } from "../lib/exec"
import { runServeCommand } from "./serve"

export async function runSetupCommand(args: string[]): Promise<number> {
  if (args.length > 0) {
    console.error("brezel setup does not accept additional arguments.")
    return 1
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error("brezel setup requires an interactive terminal.")
    return 1
  }

  const envPath = ensureProjectEnvFile()
  const currentSystemIdentifier = getSingleSystemIdentifier()

  await ensureToken(envPath, "COMPOSER_TOKEN", "Composer token")
  await ensureToken(envPath, "NPM_TOKEN", "npm token")

  const finalSystemIdentifier = await maybeRenameSystem(currentSystemIdentifier, envPath)
  writeEnvValue(envPath, "APP_SYSTEM", finalSystemIdentifier)

  console.log("")
  console.log("Installing Composer dependencies...")
  if (await runComposeCommandInteractive(["run", "--rm", "deps"]) !== 0) {
    return 1
  }

  console.log("")
  console.log("Installing npm dependencies...")
  if (await runComposeCommandInteractive(["run", "--rm", "node_deps"]) !== 0) {
    return 1
  }

  console.log("")
  console.log("Preparing database and app container...")
  if (runComposeCommand(["up", "-d", "mariadb", "app"]) !== 0) {
    return 1
  }

  console.log("")
  console.log("Initializing Brezel...")
  if (await runComposeCommandInteractive(["exec", "app", "php", "bakery", "init"]) !== 0) {
    return 1
  }

  console.log("")
  console.log(`Creating system '${finalSystemIdentifier}'...`)
  if (await runComposeCommandInteractive(["exec", "app", "php", "bakery", "system", "create", finalSystemIdentifier]) !== 0) {
    return 1
  }

  console.log("")
  console.log("Running first update...")
  if (await runComposeCommandInteractive(["exec", "app", "php", "bakery", "migrate", "--force"]) !== 0) {
    return 1
  }
  if (await runComposeCommandInteractive(["exec", "app", "php", "bakery", "load"]) !== 0) {
    return 1
  }
  if (await runComposeCommandInteractive(["exec", "app", "php", "bakery", "apply"]) !== 0) {
    return 1
  }

  console.log("")
  console.log("Setup complete. Starting Brezel...")
  return await runServeCommand([])
}

async function ensureToken(envPath: string, key: string, label: string): Promise<void> {
  const existingValue = readEnvValue(envPath, key)

  if (existingValue) {
    const shouldReplace = await askYesNo(`${label} already exists (${maskSecret(existingValue)}). Replace it?`, false)
    if (!shouldReplace) {
      return
    }
  }

  const value = await askRequiredValue(`Enter ${label}:`)
  writeEnvValue(envPath, key, value)
}

async function maybeRenameSystem(currentIdentifier: string, envPath: string): Promise<string> {
  const shouldRename = await askYesNo(`Current system identifier is '${currentIdentifier}'. Rename it?`, false)
  if (!shouldRename) {
    return currentIdentifier
  }

  while (true) {
    const nextIdentifier = (await askRequiredValue(`Enter the new system identifier [${currentIdentifier}]:`)).trim()
    if (!isValidIdentifier(nextIdentifier)) {
      console.log("Use only lowercase letters, digits, '-' and '_' for the system identifier.")
      continue
    }

    if (nextIdentifier === currentIdentifier) {
      return currentIdentifier
    }

    renameSystem(currentIdentifier, nextIdentifier)
    writeEnvValue(envPath, "APP_SYSTEM", nextIdentifier)
    return nextIdentifier
  }
}

function getSingleSystemIdentifier(): string {
  const systemsDir = join(getProjectDir(), "systems")
  const identifiers = readdirSync(systemsDir)
    .filter((entry) => !entry.startsWith("."))
    .filter((entry) => statSync(join(systemsDir, entry)).isDirectory())

  if (identifiers.length !== 1) {
    throw new Error(`brezel setup currently expects exactly one system directory in 'systems/', found ${identifiers.length}.`)
  }

  return identifiers[0]
}

function renameSystem(currentIdentifier: string, nextIdentifier: string): void {
  const systemsDir = join(getProjectDir(), "systems")
  const currentDir = join(systemsDir, currentIdentifier)
  const nextDir = join(systemsDir, nextIdentifier)

  if (existsSync(nextDir)) {
    throw new Error(`The target system directory '${nextIdentifier}' already exists.`)
  }

  const hostnamesPath = join(currentDir, "hostnames.bake.json")
  const hostnames = JSON.parse(readFileSync(hostnamesPath, "utf-8")) as Array<{ resource_hostname?: string, resource?: { hostname?: string } }>
  const currentHostnameKey = hostnames[0]?.resource_hostname
  const currentHostnameValue = hostnames[0]?.resource?.hostname

  if (!Array.isArray(hostnames) || hostnames.length === 0) {
    throw new Error("Could not parse systems/<system>/hostnames.bake.json.")
  }

  hostnames[0].resource_hostname = nextIdentifier
  if (!hostnames[0].resource) {
    hostnames[0].resource = {}
  }
  hostnames[0].resource.hostname = nextIdentifier
  writeFileSync(hostnamesPath, `${JSON.stringify(hostnames, null, 2)}\n`)

  const identifierCandidates = new Set<string>([
    currentIdentifier,
    currentHostnameKey,
    currentHostnameValue,
    "example",
  ].filter((value): value is string => Boolean(value)))

  rewriteSystemHostnameReferences(currentDir, identifierCandidates, nextIdentifier)
  renameSync(currentDir, nextDir)
}

function rewriteSystemHostnameReferences(systemDir: string, oldIdentifiers: Set<string>, nextIdentifier: string): void {
  for (const filePath of walkFiles(systemDir)) {
    const original = readFileSync(filePath, "utf-8")
    let nextContent = original

    for (const identifier of oldIdentifiers) {
      nextContent = nextContent.replaceAll(`resource_hostname.${identifier}.hostname`, `resource_hostname.${nextIdentifier}.hostname`)
    }

    if (nextContent !== original) {
      writeFileSync(filePath, nextContent)
    }
  }
}

function walkFiles(directory: string): string[] {
  const result: string[] = []

  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) {
      result.push(...walkFiles(fullPath))
      continue
    }

    result.push(fullPath)
  }

  return result
}

function isValidIdentifier(value: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/.test(value)
}

async function askYesNo(question: string, defaultValue: boolean): Promise<boolean> {
  const defaultLabel = defaultValue ? "Y/n" : "y/N"

  while (true) {
    const answer = (await askQuestion(`${question} [${defaultLabel}]`)).trim().toLowerCase()
    if (!answer) {
      return defaultValue
    }
    if (["y", "yes"].includes(answer)) {
      return true
    }
    if (["n", "no"].includes(answer)) {
      return false
    }
  }
}

async function askRequiredValue(question: string): Promise<string> {
  while (true) {
    const answer = (await askQuestion(question)).trim()
    if (answer.length > 0) {
      return answer
    }
  }
}

async function askQuestion(question: string): Promise<string> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return await new Promise<string>((resolve) => {
    readline.question(`${question} `, (answer) => {
      readline.close()
      resolve(answer)
    })
  })
}

function maskSecret(value: string): string {
  if (value.length <= 8) {
    return `${value.slice(0, 2)}...${value.slice(-2)}`
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`
}
