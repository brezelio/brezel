import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { getProjectDir } from "./exec"

export function getSingleSystemIdentifier(): string {
  const systemsDir = join(getProjectDir(), "systems")
  const identifiers = readdirSync(systemsDir)
    .filter((entry) => !entry.startsWith("."))
    .filter((entry) => !entry.includes("__test__"))
    .filter((entry) => statSync(join(systemsDir, entry)).isDirectory())

  if (identifiers.length !== 1) {
    throw new Error(`brezel currently expects exactly one system directory in 'systems/', found ${identifiers.length}.`)
  }

  return identifiers[0]
}

export function renameSystem(currentIdentifier: string, nextIdentifier: string): void {
  const systemsDir = join(getProjectDir(), "systems")
  const currentDir = join(systemsDir, currentIdentifier)
  const nextDir = join(systemsDir, nextIdentifier)

  if (existsSync(nextDir)) {
    throw new Error(`The target system directory '${nextIdentifier}' already exists.`)
  }

  const hostnamesPath = join(currentDir, "hostnames.bake.json")
  const hostnames = JSON.parse(readFileSync(hostnamesPath, "utf-8")) as Array<{ resource_hostname?: string, resource?: { hostname?: string } }>

  if (!Array.isArray(hostnames) || hostnames.length === 0) {
    throw new Error("Could not parse systems/<system>/hostnames.bake.json.")
  }

  if (!hostnames[0].resource) {
    hostnames[0].resource = {}
  }

  hostnames[0].resource.hostname = nextIdentifier
  writeFileSync(hostnamesPath, `${JSON.stringify(hostnames, null, 2)}\n`)
  renameSync(currentDir, nextDir)
}

export function isValidSystemIdentifier(value: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/.test(value)
}

export function slugifySystemIdentifier(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
