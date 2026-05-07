import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { runComposeCommandInteractive } from "../lib/compose"
import { getProjectDir, runProjectCommandInteractive } from "../lib/exec"
import { askChoice } from "../lib/questions"
import { assertInteractiveTerminal } from "../lib/validation"

type LogTarget = "all" | "app" | "bootstrap" | "file" | "scheduler" | "vite" | "workers"

const validTargets: LogTarget[] = ["all", "app", "bootstrap", "file", "scheduler", "vite", "workers"]

export async function runLogsCommand(args: string[]): Promise<number> {
  const [target, ...rest] = args

  if (!target || !validTargets.includes(target as LogTarget)) {
    console.error(`Usage: brezel logs <${validTargets.join("|")}>`)
    return 1
  }

  switch (target as LogTarget) {
    case "all":
      if (rest.length > 0) {
        console.error(`Usage: brezel logs <${validTargets.join("|")}>`)
        return 1
      }
      return await runComposeCommandInteractive(["logs", "-f", "app", "vite", "workers", "scheduler", "deps", "node_deps", "mariadb"])
    case "app":
      if (rest.length > 0) {
        console.error(`Usage: brezel logs <${validTargets.join("|")}>`)
        return 1
      }
      return await runComposeCommandInteractive(["logs", "-f", "app"])
    case "bootstrap":
      if (rest.length > 0) {
        console.error(`Usage: brezel logs <${validTargets.join("|")}>`)
        return 1
      }
      return await runComposeCommandInteractive(["logs", "-f", "deps", "node_deps"])
    case "file":
      return await runFileLogsCommand(rest)
    case "scheduler":
      if (rest.length > 0) {
        console.error(`Usage: brezel logs <${validTargets.join("|")}>`)
        return 1
      }
      return await runComposeCommandInteractive(["logs", "-f", "scheduler"])
    case "vite":
      if (rest.length > 0) {
        console.error(`Usage: brezel logs <${validTargets.join("|")}>`)
        return 1
      }
      return await runComposeCommandInteractive(["logs", "-f", "vite"])
    case "workers":
      if (rest.length > 0) {
        console.error(`Usage: brezel logs <${validTargets.join("|")}>`)
        return 1
      }
      return await runComposeCommandInteractive(["logs", "-f", "workers"])
  }
}

async function runFileLogsCommand(args: string[]): Promise<number> {
  if (!assertInteractiveTerminal("brezel logs file")) {
    return 1
  }

  const logFiles = getLocalLogFiles()
  if (logFiles.length === 0) {
    console.error("No log files found in storage/logs.")
    return 1
  }

  let selectedFile = args[0]
  if (args.length > 1) {
    console.error("Usage: brezel logs file [filename]")
    return 1
  }

  if (selectedFile && !logFiles.includes(selectedFile)) {
    console.error(`Unknown logfile: ${selectedFile}`)
    console.error(`Available files: ${logFiles.join(", ")}`)
    return 1
  }

  if (!selectedFile) {
    selectedFile = await askChoice("Choose a logfile from storage/logs:", logFiles)
    if (selectedFile === null) {
      return 130
    }
  }

  const filePath = join(getProjectDir(), "storage", "logs", selectedFile)
  return await runProjectCommandInteractive({
    unixCommand: "tspin",
    windowsCommand: "tspin",
    args: [filePath],
  })
}

function getLocalLogFiles(): string[] {
  const logsDir = join(getProjectDir(), "storage", "logs")

  return readdirSync(logsDir)
    .filter((entry) => !entry.startsWith("."))
    .filter((entry) => statSync(join(logsDir, entry)).isFile())
    .sort((left, right) => left.localeCompare(right))
}
