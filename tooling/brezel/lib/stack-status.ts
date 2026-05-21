import { runComposeCommandCaptured, runComposeCommandCapturedAsync } from "./compose"

type ComposePsRow = {
  Service?: string
  State?: string
}

type StackPhase = "running" | "restarting" | "stopped" | "unknown"

export type StackStatus = {
  phase: StackPhase
  label: string
  detail: string
}

const runtimeServices = ["mariadb", "app", "workers", "scheduler", "vite"] as const

export function readStackStatus(): StackStatus {
  const result = runComposeCommandCaptured(["ps", "--all", "--format", "json"])
  return buildStackStatus(result.exitCode, result.stdout)
}

export async function readStackStatusAsync(): Promise<StackStatus> {
  const result = await runComposeCommandCapturedAsync(["ps", "--all", "--format", "json"])
  return buildStackStatus(result.exitCode, result.stdout)
}

function buildStackStatus(exitCode: number, stdout: string): StackStatus {
  if (exitCode !== 0) {
    return {
      phase: "unknown",
      label: "stack: unknown",
      detail: "docker unavailable",
    }
  }

  const rows = parseComposePsRows(stdout)
  const states = new Map(rows.map((row) => [row.Service ?? "", (row.State ?? "").toLowerCase()]))

  let running = 0
  let restarting = 0
  let stopped = 0
  let missing = 0

  for (const service of runtimeServices) {
    const state = states.get(service)
    if (!state) {
      missing += 1
      continue
    }

    if (state === "running") {
      running += 1
      continue
    }

    if (state === "restarting") {
      restarting += 1
      continue
    }

    stopped += 1
  }

  if (running === runtimeServices.length) {
    return {
      phase: "running",
      label: "stack: running",
      detail: `${running}/${runtimeServices.length} services up`,
    }
  }

  if (running > 0 || restarting > 0) {
    return {
      phase: "restarting",
      label: "stack: restarting",
      detail: `${running}/${runtimeServices.length} running${restarting > 0 ? `, ${restarting} restarting` : ""}`,
    }
  }

  if (stopped > 0 || missing === runtimeServices.length) {
    return {
      phase: "stopped",
      label: "stack: stopped",
      detail: rows.length > 0 ? "containers not running" : "no containers",
    }
  }

  return {
    phase: "unknown",
    label: "stack: unknown",
    detail: "status unavailable",
  }
}

function parseComposePsRows(output: string): ComposePsRow[] {
  const trimmed = output.trim()
  if (!trimmed) {
    return []
  }

  try {
    const parsed = JSON.parse(trimmed) as ComposePsRow[] | ComposePsRow
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .flatMap((line) => {
        try {
          return [JSON.parse(line) as ComposePsRow]
        } catch {
          return []
        }
      })
  }
}
