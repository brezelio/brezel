import { runComposeCommandStreamingCaptured } from "../lib/compose"
import { buildCommandOutput } from "../lib/output"
import { assertNoArgs } from "../lib/validation"
import type { CommandOutput } from "../lib/ui"

type LiveOutputUpdater = (title: string, lines: string[]) => void

const exploreDbUrl = "http://localhost:2044"

export async function runExploreDbCommand(args: string[]): Promise<number> {
  if (!assertNoArgs("brezel explore-db", args)) {
    return 1
  }

  const output = await startExploreDb()

  if (output.lines.length > 0) {
    for (const line of output.lines) {
      console.log(line)
    }
  }

  return output.success ? 0 : 1
}

export async function startExploreDb(onUpdate?: LiveOutputUpdater): Promise<CommandOutput> {
  let stdout = ""
  let stderr = ""

  const result = await runComposeCommandStreamingCaptured(["up", "-d", "mariadb", "phpmyadmin"], {
    mirrorStdout: onUpdate ? false : true,
    mirrorStderr: onUpdate ? false : true,
    onStdoutChunk: (chunk) => {
      stdout += chunk
      onUpdate?.("brezel explore-db", normalizeChunkOutput(stdout, stderr))
    },
    onStderrChunk: (chunk) => {
      stderr += chunk
      onUpdate?.("brezel explore-db", normalizeChunkOutput(stdout, stderr))
    },
  })

  const output = buildCommandOutput("brezel explore-db", result.stdout, result.stderr, result.exitCode)
  if (output.success) {
    output.lines.push("")
    output.lines.push(`phpMyAdmin is available at ${exploreDbUrl}`)
    output.lines.push("You are already connected with the configured Brezel database user.")
  }

  return output
}

function normalizeChunkOutput(stdout: string, stderr: string): string[] {
  const output = buildCommandOutput("brezel explore-db", stdout, stderr, 0)
  return output.lines.length > 0 ? output.lines : ["Starting phpMyAdmin..."]
}
