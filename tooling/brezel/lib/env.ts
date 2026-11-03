import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { getProjectDir } from "./exec"

export function getProjectEnvValue(key: string): string | undefined {
  const candidates = [getProjectEnvPath(), getProjectEnvExamplePath()]

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

export function getProjectEnvPath(): string {
  return join(getProjectDir(), ".env")
}

export function getProjectEnvExamplePath(): string {
  return join(getProjectDir(), ".env.example")
}

export function ensureProjectEnvFile(): string {
  const envPath = getProjectEnvPath()

  if (!existsSync(envPath)) {
    copyFileSync(getProjectEnvExamplePath(), envPath)
  }

  return envPath
}

export function readEnvValue(filePath: string, key: string): string | undefined {
  return readEnvValueFromFile(filePath, key)
}

export function writeEnvValue(filePath: string, key: string, value: string): void {
  const rawContent = existsSync(filePath) ? readFileSync(filePath, "utf-8") : ""
  const lines = rawContent.length > 0 ? rawContent.split(/\r?\n/) : []
  const nextLine = `${key}=${value}`
  let replaced = false

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const separatorIndex = line.indexOf("=")
    if (separatorIndex === -1) {
      continue
    }

    const currentKey = line.slice(0, separatorIndex).trim()
    if (currentKey !== key) {
      continue
    }

    lines[index] = nextLine
    replaced = true
    break
  }

  if (!replaced) {
    if (lines.length > 0 && lines[lines.length - 1] !== "") {
      lines.push("")
    }
    lines.push(nextLine)
  }

  writeFileSync(filePath, `${lines.join("\n").replace(/\n*$/, "")}\n`)
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
