import { runBakeryCommand } from "./commands/bakery"
import { runServeCommand } from "./commands/serve"
import { runSetupCommand } from "./commands/setup"

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
  brezel serve
  brezel setup

Commands:
  bakery   Run bakery inside the app container
  serve    Run the local serve workflow via mise
  setup    Placeholder for the future interactive setup flow
`)
}
