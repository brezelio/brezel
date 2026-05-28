import { runAttachCommand } from "./commands/attach"
import { runAnimateCommand } from "./commands/animate"
import { runApplyCommand } from "./commands/apply"
import { runBakeryCommand } from "./commands/bakery"
import { runExploreDbCommand } from "./commands/explore-db"
import { runLinkCommand } from "./commands/link"
import { runLoadCommand } from "./commands/load"
import { runLogsCommand } from "./commands/logs"
import { runRestartCommand } from "./commands/restart"
import { runShellCommand } from "./commands/shell"
import { runServeCommand } from "./commands/serve"
import { runSetupCommand } from "./commands/setup"
import { runStopCommand } from "./commands/stop"
import { runSystemCommand } from "./commands/system"
import { runTeardownCommand } from "./commands/teardown"
import { runUnlinkCommand } from "./commands/unlink"
import { runUpdateCommand } from "./commands/update"
import { commandMetadata } from "./lib/command-metadata"

type CommandHandler = (args: string[]) => number | Promise<number>

type CommandDefinition = {
  name: string
  usage: string
  description: string
  handler: CommandHandler
}

const commandHandlers: Record<string, CommandHandler> = {
  bakery: runBakeryCommand,
  animate: runAnimateCommand,
  attach: runAttachCommand,
  apply: runApplyCommand,
  "explore-db": runExploreDbCommand,
  link: runLinkCommand,
  load: runLoadCommand,
  logs: runLogsCommand,
  restart: runRestartCommand,
  shell: runShellCommand,
  update: runUpdateCommand,
  serve: runServeCommand,
  setup: runSetupCommand,
  stop: runStopCommand,
  system: runSystemCommand,
  teardown: runTeardownCommand,
  unlink: runUnlinkCommand,
}

const commandDefinitions: CommandDefinition[] = commandMetadata.map((command) => ({
  ...command,
  handler: commandHandlers[command.name],
}))

const commandMap = new Map(commandDefinitions.map((command) => [command.name, command]))

export async function runCli(args: string[]): Promise<number> {
  const [commandName, ...rest] = args

  if (!commandName || ["help", "--help", "-h"].includes(commandName)) {
    printHelp()
    return 0
  }

  const command = commandMap.get(commandName)
  if (!command) {
    console.error(`Unknown brezel command: ${commandName}`)
    console.error("")
    printHelp()
    return 1
  }

  return await command.handler(rest)
}

function printHelp(): void {
  console.log(`Brezel CLI - Local development environment for the Brezel project

Usage:
${commandDefinitions.map((command) => `  ${command.usage}`).join("\n")}

Commands:
${commandDefinitions.map((command) => `  ${command.name.padEnd(8, " ")} ${command.description}`).join("\n")}
`)
}
