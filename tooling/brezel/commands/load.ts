import { runBakeryArgs } from "../lib/bakery"
import { sendLinuxNotification } from "../lib/notifications"

export function runLoadCommand(args: string[]): number {
  if (args.length > 0) {
    console.error("brezel load does not accept additional arguments.")
    return 1
  }

  const start = Date.now()

  console.log("bakery load...")
  const exitCode = runBakeryArgs(["load"])

  const durationInSeconds = Math.floor((Date.now() - start) / 1000)
  console.log(`brezel load took: ${durationInSeconds} second(s)`)

  if (exitCode === 0) {
    sendLinuxNotification(
      "Load is done",
      `The changes from brezel load should be visible. It took ${durationInSeconds} second(s).`,
    )
  }

  return exitCode
}
