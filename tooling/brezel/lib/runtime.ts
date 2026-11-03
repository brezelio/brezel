import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { getProjectDir } from "./exec"
import { portIsBusy } from "./ports"

export type RuntimeService = "spa" | "api" | "ws" | "phpmyadmin"

export type RuntimeState = {
  system: string
  ports: Record<RuntimeService, number>
  urls: Record<RuntimeService, string>
}

const stateDir = join(getProjectDir(), ".brezel-state")
const runtimeStateFile = join(stateDir, "runtime.json")
const composeRuntimeFile = join(stateDir, "compose.runtime.yaml")

const preferredPorts: Record<RuntimeService, number> = {
  spa: 2040,
  api: 2041,
  ws: 2043,
  phpmyadmin: 2044,
}

const fallbackPortStart = 2140

export async function ensureRuntimeState(system: string): Promise<RuntimeState> {
  const existing = readRuntimeState()
  if (existing && existing.system === system && await runtimePortsAvailable(existing.ports)) {
    writeRuntimeState(existing)
    return existing
  }

  const ports = await allocateRuntimePorts()
  const state = buildRuntimeState(system, ports)
  writeRuntimeState(state)
  return state
}

export function readRuntimeState(): RuntimeState | null {
  if (!existsSync(runtimeStateFile)) {
    return null
  }

  try {
    return JSON.parse(readFileSync(runtimeStateFile, "utf-8")) as RuntimeState
  } catch {
    return null
  }
}

export function writeRuntimeState(state: RuntimeState): void {
  mkdirSync(stateDir, { recursive: true })
  writeFileSync(runtimeStateFile, `${JSON.stringify(state, null, 2)}\n`)
  writeFileSync(composeRuntimeFile, buildComposeRuntimeOverride(state))
}

export function clearRuntimeState(): void {
  if (existsSync(runtimeStateFile)) {
    rmSync(runtimeStateFile)
  }

  if (existsSync(composeRuntimeFile)) {
    rmSync(composeRuntimeFile)
  }
}

export function getComposeRuntimeFilePath(): string {
  return composeRuntimeFile
}

function buildRuntimeState(system: string, ports: Record<RuntimeService, number>): RuntimeState {
  const spaHost = `${system}.localhost`
  const apiHost = `api.${system}.localhost`
  const wsHost = `ws.${system}.localhost`
  const phpMyAdminHost = `db.${system}.localhost`

  return {
    system,
    ports,
    urls: {
      spa: `http://${spaHost}:${ports.spa}`,
      api: `http://${apiHost}:${ports.api}`,
      ws: `http://${wsHost}:${ports.ws}`,
      phpmyadmin: `http://${phpMyAdminHost}:${ports.phpmyadmin}`,
    },
  }
}

async function allocateRuntimePorts(): Promise<Record<RuntimeService, number>> {
  if (await runtimePortsAvailable(preferredPorts)) {
    return { ...preferredPorts }
  }

  const allocated = new Set<number>()

  return {
    spa: await findFreePort(fallbackPortStart, allocated),
    api: await findFreePort(fallbackPortStart, allocated),
    ws: await findFreePort(fallbackPortStart, allocated),
    phpmyadmin: await findFreePort(fallbackPortStart, allocated),
  }
}

async function runtimePortsAvailable(ports: Record<RuntimeService, number>): Promise<boolean> {
  for (const port of Object.values(ports)) {
    if (await portIsBusy(port)) {
      return false
    }
  }

  return true
}

async function findFreePort(start: number, allocated: Set<number>): Promise<number> {
  for (let port = start; port < 65535; port += 1) {
    if (allocated.has(port)) {
      continue
    }

    if (await portIsBusy(port)) {
      continue
    }

    allocated.add(port)
    return port
  }

  throw new Error("Could not allocate a free local port for Brezel runtime services.")
}

function buildComposeRuntimeOverride(state: RuntimeState): string {
  const lines = [
    "services:",
    "  app:",
    "    environment:",
    `      APP_URL: ${yamlString(state.urls.api)}`,
    `      BREZEL_BROTCAST_HOST: ${yamlString(`ws.${state.system}.localhost`)}`,
    `      BREZEL_BROTCAST_PORT: ${yamlString(String(state.ports.ws))}`,
    `      BREZEL_BROTCAST_SCHEME: ${yamlString("http")}`,
    "    ports:",
    `      - ${yamlString(`${state.ports.api}:8081`)}`,
    "  workers:",
    "    ports:",
    `      - ${yamlString(`${state.ports.ws}:8086`)}`,
    "  vite:",
    "    environment:",
    `      VITE_APP_API_URL: ${yamlString(state.urls.api)}`,
    "    ports:",
    `      - ${yamlString(`${state.ports.spa}:2040`)}`,
    "  phpmyadmin:",
    "    ports:",
    `      - ${yamlString(`${state.ports.phpmyadmin}:80`)}`,
  ]

  return `${lines.join("\n")}\n`
}

function yamlString(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"")}"`
}
