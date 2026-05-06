export type ServeDashboardCommandPolicy = {
  allowed: boolean
  reason?: string
}

export type CommandMetadata = {
  name: string
  usage: string
  description: string
  serveDashboard: ServeDashboardCommandPolicy
}

export const commandMetadata: CommandMetadata[] = [
  {
    name: "bakery",
    usage: "brezel bakery <args...>",
    description: "Run bakery inside the app container",
    serveDashboard: { allowed: true },
  },
  {
    name: "animate",
    usage: "brezel animate",
    description: "Show the Brezel ASCII shimmer animation",
    serveDashboard: {
      allowed: false,
      reason: "brezel animate takes over the terminal and cannot run inside the serve dashboard.",
    },
  },
  {
    name: "attach",
    usage: "brezel attach",
    description: "Open an interactive shell inside the app container",
    serveDashboard: {
      allowed: false,
      reason: "brezel attach opens an interactive shell and cannot run inside the serve dashboard.",
    },
  },
  {
    name: "apply",
    usage: "brezel apply",
    description: "Run bakery apply in the app container",
    serveDashboard: { allowed: true },
  },
  {
    name: "explore-db",
    usage: "brezel explore-db",
    description: "Start phpMyAdmin for the local Brezel MariaDB instance",
    serveDashboard: { allowed: true },
  },
  {
    name: "link",
    usage: "brezel link",
    description: "Link a local brezel/api or brezel/spa checkout into this project",
    serveDashboard: { allowed: true },
  },
  {
    name: "load",
    usage: "brezel load",
    description: "Run bakery load in the app container",
    serveDashboard: { allowed: true },
  },
  {
    name: "logs",
    usage: "brezel logs <target>",
    description: "Follow logs for a local dev target",
    serveDashboard: {
      allowed: false,
      reason: "brezel logs stays attached in the foreground. Use the dashboard log shortcuts instead.",
    },
  },
  {
    name: "shell",
    usage: "brezel shell",
    description: "Open the interactive project shell used inside Zellij",
    serveDashboard: {
      allowed: false,
      reason: "brezel shell opens an interactive shell and cannot run inside the serve dashboard.",
    },
  },
  {
    name: "update",
    usage: "brezel update",
    description: "Run migrate, load, and apply in the app container",
    serveDashboard: { allowed: true },
  },
  {
    name: "serve",
    usage: "brezel serve [interactive] [--rebuild]",
    description: "Start the local Docker stack in the foreground, optionally interactive and/or rebuilt first",
    serveDashboard: {
      allowed: false,
      reason: "brezel serve cannot be started from inside the serve dashboard.",
    },
  },
  {
    name: "setup",
    usage: "brezel setup",
    description: "Configure .env, install dependencies, initialize Brezel, and start it",
    serveDashboard: {
      allowed: false,
      reason: "brezel setup is an interactive first-run flow and cannot run inside the serve dashboard.",
    },
  },
  {
    name: "teardown",
    usage: "brezel teardown [--force]",
    description: "Stop the local Docker stack and remove its volumes and local images",
    serveDashboard: {
      allowed: false,
      reason: "brezel teardown stops the Docker stack that powers this dashboard, so it is blocked here.",
    },
  },
  {
    name: "unlink",
    usage: "brezel unlink [api|spa|all]",
    description: "Remove local brezel/api or brezel/spa links from this project",
    serveDashboard: { allowed: true },
  },
]

const commandMetadataMap = new Map(commandMetadata.map((command) => [command.name, command]))

export function getCommandMetadata(name: string): CommandMetadata | undefined {
  return commandMetadataMap.get(name)
}
