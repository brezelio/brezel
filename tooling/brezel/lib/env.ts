import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { getProjectDir } from "./exec"

export function getProjectEnvValue(key: string): string | undefined {
  const projectDir = getProjectDir()
  const candidates = [join(projectDir, ".env"), join(projectDir, ".env.example")]

  for (const filePath of candidates) {
    if (!existsSync(filePath)) {
      continue
    }

    const value = readEnvValueFromFile(filePath, key)
    if (value !== undefined) {
      return value
    }
  }

  return undefined
}

function readEnvValueFromFile(filePath: string, key: string): string | undefined {
  const lines = readFileSync(filePath, "utf-8").split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) {
      continue
    }

    const separatorIndex = line.indexOf("=")
    if (separatorIndex === -1) {
      continue
    }

    const currentKey = line.slice(0, separatorIndex).trim()
    if (currentKey !== key) {
      continue
    }

    return normalizeEnvValue(line.slice(separatorIndex + 1).trim())
  }

  return undefined
}

function normalizeEnvValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}
