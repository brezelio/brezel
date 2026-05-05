import type { CommandOutput } from "./ui"
import { stripAnsi } from "./ui"

export function buildCommandOutput(title: string, stdout: string, stderr: string, exitCode: number): CommandOutput {
  const lines = normalizeOutputLines(stdout, stderr)

  return {
    title,
    lines: lines.length > 0 ? lines : [exitCode === 0 ? "Command completed successfully." : "Command failed without output."],
    success: exitCode === 0,
  }
}

export function normalizeOutputLines(stdout: string, stderr: string): string[] {
  const combined = [stdout.trimEnd(), stderr.trimEnd()].filter((value) => value.length > 0).join("\n")
  if (!combined) {
    return []
  }

  return combined
    .split(/\r?\n/)
    .map((line) => stripAnsi(line))
}
