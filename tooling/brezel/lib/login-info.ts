import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { getProjectEnvValue } from "./env"
import { getProjectDir } from "./exec"

type UserResourceEntry = {
  resource_user?: string
  resource?: {
    root?: boolean
    fields?: {
      email?: string
      password?: string
    }
  }
}

export type LoginInfo = {
  email: string
  password: string
  root: boolean
}

export function readLoginInfo(system: string): LoginInfo[] {
  const resourceFile = findUserResourceFile(system)
  if (!resourceFile) {
    return []
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(resourceFile, "utf-8"))
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed
    .map((entry) => toLoginInfo(entry as UserResourceEntry))
    .filter((entry): entry is LoginInfo => entry !== null)
}

function toLoginInfo(entry: UserResourceEntry): LoginInfo | null {
  const email = entry.resource?.fields?.email?.trim()
  const passwordExpression = entry.resource?.fields?.password?.trim()
  if (!email || !passwordExpression) {
    return null
  }

  return {
    email,
    password: resolvePassword(passwordExpression),
    root: entry.resource?.root === true || entry.resource_user === "root",
  }
}

function resolvePassword(expression: string): string {
  const appEnv = getProjectEnvValue("APP_ENV") || "local"
  if (appEnv === "local") {
    return "secret"
  }

  const match = expression.match(/^\$\{env\('([^']+)',\s*'([^']*)'\)\}$/)
  if (!match) {
    return expression
  }

  const [, key, fallback] = match
  return process.env[key] || getProjectEnvValue(key) || fallback
}

function findUserResourceFile(system: string): string | null {
  const systemDir = join(getProjectDir(), "systems", system)
  if (!existsSync(systemDir)) {
    return null
  }

  const preferredPath = join(systemDir, "config", "users.entities.bake.json")
  if (existsSync(preferredPath)) {
    return preferredPath
  }

  for (const filePath of walk(systemDir)) {
    if (!filePath.endsWith(".entities.bake.json")) {
      continue
    }

    try {
      const content = readFileSync(filePath, "utf-8")
      if (content.includes('"resource_user"')) {
        return filePath
      }
    } catch {
      continue
    }
  }

  return null
}

function walk(directory: string): string[] {
  const results: string[] = []

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      results.push(...walk(entryPath))
      continue
    }

    results.push(entryPath)
  }

  return results
}
