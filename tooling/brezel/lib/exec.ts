import { spawnSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const toolingDir = dirname(fileURLToPath(import.meta.url))
const projectDir = resolve(toolingDir, "../../..")

type ProjectCommand = {
  unixCommand: string
  windowsCommand: string
  args: string[]
}

export function runProjectCommand(command: ProjectCommand): number {
  const result = process.platform === "win32"
    ? spawnSync("cmd.exe", ["/c", command.windowsCommand, ...command.args], {
        cwd: projectDir,
        stdio: "inherit",
      })
    : spawnSync(command.unixCommand, command.args, {
        cwd: projectDir,
        stdio: "inherit",
      })

  if (result.error) {
    console.error(result.error.message)
    return 1
  }

  return result.status ?? 0
}
