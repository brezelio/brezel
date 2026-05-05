import { runAttachCommand } from "./commands/attach"
import { runApplyCommand } from "./commands/apply"
import { runBakeryCommand } from "./commands/bakery"
import { runExploreDbCommand } from "./commands/explore-db"
import { runLoadCommand } from "./commands/load"
import { runLogsCommand } from "./commands/logs"
import { runShellCommand } from "./commands/shell"
import { runServeCommand } from "./commands/serve"
import { runSetupCommand } from "./commands/setup"
import { runTeardownCommand } from "./commands/teardown"
import { runUpdateCommand } from "./commands/update"

type CommandHandler = (args: string[]) => number | Promise<number>

type CommandDefinition = {
  name: string
  usage: string
  description: string
  handler: CommandHandler
}

const commandDefinitions: CommandDefinition[] = [
  {
    name: "bakery",
    usage: "brezel bakery <args...>",
    description: "Run bakery inside the app container",
    handler: runBakeryCommand,
  },
  {
    name: "attach",
    usage: "brezel attach",
    description: "Open an interactive shell inside the app container",
    handler: runAttachCommand,
  },
  {
    name: "apply",
    usage: "brezel apply",
    description: "Run bakery apply in the app container",
    handler: runApplyCommand,
  },
  {
    name: "explore-db",
    usage: "brezel explore-db",
    description: "Start phpMyAdmin for the local Brezel MariaDB instance",
    handler: runExploreDbCommand,
  },
  {
    name: "load",
    usage: "brezel load",
    description: "Run bakery load in the app container",
    handler: runLoadCommand,
  },
  {
    name: "logs",
    usage: "brezel logs <target>",
    description: "Follow logs for a local dev target",
    handler: runLogsCommand,
  },
  {
    name: "shell",
    usage: "brezel shell",
    description: "Open the interactive project shell used inside Zellij",
    handler: runShellCommand,
  },
  {
    name: "update",
    usage: "brezel update",
    description: "Run migrate, load, and apply in the app container",
    handler: runUpdateCommand,
  },
  {
    name: "serve",
    usage: "brezel serve [interactive] [--rebuild]",
    description: "Start the local Docker stack in the foreground, optionally interactive and/or rebuilt first",
    handler: runServeCommand,
  },
  {
    name: "setup",
    usage: "brezel setup",
    description: "Configure .env, install dependencies, initialize Brezel, and start it",
    handler: runSetupCommand,
  },
  {
    name: "teardown",
    usage: "brezel teardown",
    description: "Stop the local Docker stack and remove its volumes and local images",
    handler: runTeardownCommand,
  },
]

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
