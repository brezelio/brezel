import { runComposeCommand, runComposeCommandInteractive } from "../lib/compose"

type LogTarget = "all" | "app" | "bootstrap" | "scheduler" | "vite" | "workers"

const validTargets: LogTarget[] = ["all", "app", "bootstrap", "scheduler", "vite", "workers"]

export async function runLogsCommand(args: string[]): Promise<number> {
  const [target, ...rest] = args

  if (!target || rest.length > 0 || !validTargets.includes(target as LogTarget)) {
    console.error(`Usage: brezel logs <${validTargets.join("|")}>`)
    return 1
  }

  switch (target as LogTarget) {
    case "all":
      return await runComposeCommandInteractive(["logs", "-f", "app", "vite", "workers", "scheduler", "deps", "node_deps", "mariadb"])
    case "app":
      return await runComposeCommandInteractive(["logs", "-f", "app"])
    case "bootstrap":
      return await runComposeCommandInteractive(["logs", "-f", "deps", "node_deps"])
    case "scheduler":
      return await runComposeCommandInteractive(["logs", "-f", "scheduler"])
    case "vite":
      return await runComposeCommandInteractive(["logs", "-f", "vite"])
    case "workers":
      return await runComposeCommandInteractive(["logs", "-f", "workers"])
  }
}
