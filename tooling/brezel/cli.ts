import { runApplyCommand } from "./commands/apply"
import { runBakeryCommand } from "./commands/bakery"
import { runLoadCommand } from "./commands/load"
import { runLogsCommand } from "./commands/logs"
import { runShellCommand } from "./commands/shell"
import { runServeCommand } from "./commands/serve"
import { runSetupCommand } from "./commands/setup"
import { runUpdateCommand } from "./commands/update"

export async function runCli(args: string[]): Promise<number> {
  const [command, ...rest] = args

  switch (command) {
    case undefined:
    case "help":
    case "--help":
    case "-h":
      printHelp()
      return 0
    case "bakery":
      return runBakeryCommand(rest)
    case "apply":
      return runApplyCommand(rest)
    case "load":
      return runLoadCommand(rest)
    case "logs":
      return await runLogsCommand(rest)
    case "shell":
      return await runShellCommand(rest)
    case "update":
      return runUpdateCommand(rest)
    case "serve":
      return runServeCommand(rest)
    case "setup":
      return runSetupCommand(rest)
    default:
      console.error(`Unknown brezel command: ${command}`)
      console.error("")
      printHelp()
      return 1
  }
}

function printHelp(): void {
  console.log(`Brezel CLI (draft)

Usage:
  brezel bakery <args...>
  brezel apply
  brezel load
  brezel logs <target>
  brezel shell
  brezel update
  brezel serve
  brezel setup

Commands:
  bakery   Run bakery inside the app container
  apply    Run bakery apply in the app container
  load     Run bakery load in the app container
  logs     Follow logs for a local dev target
  shell    Open the interactive project shell used inside Zellij
  update   Run migrate, load, and apply in the app container
  serve    Start the local Docker/Zellij serve workflow
  setup    Placeholder for the future interactive setup flow
`)
}
