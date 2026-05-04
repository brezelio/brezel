import { runComposeCommand, runComposeCommandInteractive } from "../lib/compose"

type LogTarget = "app" | "bootstrap" | "scheduler" | "vite" | "workers"

const validTargets: LogTarget[] = ["app", "bootstrap", "scheduler", "vite", "workers"]

export async function runLogsCommand(args: string[]): Promise<number> {
  const [target, ...rest] = args

  if (!target || rest.length > 0 || !validTargets.includes(target as LogTarget)) {
    console.error(`Usage: brezel logs <${validTargets.join("|")}>`)
    return 1
  }

  switch (target as LogTarget) {
    case "app":
      return await runComposeCommandInteractive(["logs", "-f", "app"])
    case "bootstrap":
      return await runComposeCommandInteractive(["logs", "-f", "deps", "node_deps"])
    case "scheduler":
      return await runComposeCommandInteractive(["logs", "-f", "scheduler"])
    case "vite":
      return await runComposeCommandInteractive(["logs", "-f", "vite"])
    case "workers":
      return await runWorkersLogsCommand()
  }
}

async function runWorkersLogsCommand(): Promise<number> {
  while (true) {
    const initExitCode = runComposeCommand([
      "exec",
      "-T",
      "workers",
      "sh",
      "-lc",
      "mkdir -p storage/logs && touch storage/logs/worker.log storage/logs/brotcast.log",
    ])

    if (initExitCode === 0) {
      break
    }

    await sleep(1000)
  }

  return await runComposeCommandInteractive([
    "exec",
    "-T",
    "workers",
    "sh",
    "-lc",
    "tail -F storage/logs/worker.log storage/logs/brotcast.log",
  ])
}

async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds))
}
