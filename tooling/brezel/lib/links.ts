import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { isAbsolute, join } from "node:path"
import { getProjectDir } from "./exec"

export type LinkTarget = "api" | "spa"

type LinkState = Partial<Record<LinkTarget, string>>

const stateDir = join(getProjectDir(), ".brezel-state")
const stateFile = join(stateDir, "links.json")
const composeOverrideFile = join(stateDir, "compose.links.yaml")

export function readLinkState(): LinkState {
  if (!existsSync(stateFile)) {
    return {}
  }

  try {
    return JSON.parse(readFileSync(stateFile, "utf-8")) as LinkState
  } catch {
    return {}
  }
}

export function writeLinkState(state: LinkState): void {
  const normalizedState = normalizeState(state)

  if (Object.keys(normalizedState).length === 0) {
    if (existsSync(stateFile)) {
      rmSync(stateFile)
    }
    if (existsSync(composeOverrideFile)) {
      rmSync(composeOverrideFile)
    }
    return
  }

  mkdirSync(stateDir, { recursive: true })
  writeFileSync(stateFile, `${JSON.stringify(normalizedState, null, 2)}\n`)
  writeFileSync(composeOverrideFile, buildComposeOverride(normalizedState))
}

export function getComposeOverrideFilePath(): string {
  return composeOverrideFile
}

export function validateLinkPath(target: LinkTarget, inputPath: string): string | null {
  const trimmed = inputPath.trim()
  if (!trimmed) {
    return "Path cannot be empty."
  }
  if (!isAbsolute(trimmed)) {
    return "Please provide an absolute path."
  }
  if (!existsSync(trimmed)) {
    return "That path does not exist."
  }

  const expectedFile = target === "api" ? join(trimmed, "composer.json") : join(trimmed, "package.json")
  if (!existsSync(expectedFile)) {
    return target === "api"
      ? "That directory does not look like a brezel/api repo (composer.json missing)."
      : "That directory does not look like a brezel/spa repo (package.json missing)."
  }

  return null
}

function normalizeState(state: LinkState): LinkState {
  const result: LinkState = {}

  if (state.api) {
    result.api = state.api
  }
  if (state.spa) {
    result.spa = state.spa
  }

  return result
}

function buildComposeOverride(state: LinkState): string {
  const lines: string[] = [
    "services:",
  ]

  if (state.api) {
    const mount = yamlString(`${state.api}:/var/www/app/vendor/brezel/api`)
    for (const service of ["app", "workers", "scheduler"]) {
      lines.push(`  ${service}:`)
      lines.push("    volumes:")
      lines.push(`      - ${mount}`)
    }
  }

  if (state.spa) {
    const mount = yamlString(`${state.spa}:/var/www/app/node_modules/@kibro/brezel-spa`)
    for (const service of ["vite"]) {
      lines.push(`  ${service}:`)
      lines.push("    volumes:")
      lines.push(`      - ${mount}`)
    }
  }

  return `${lines.join("\n")}\n`
}

function yamlString(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"")}"`
}
