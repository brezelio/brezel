import { runBakeryArgs } from "../lib/bakery"
import { sendLinuxNotification } from "../lib/notifications"

export function runApplyCommand(args: string[]): number {
  if (args.length > 0) {
    console.error("brezel apply does not accept additional arguments.")
    return 1
  }

  const start = Date.now()

  console.log("bakery apply...")
  const exitCode = runBakeryArgs(["apply"])

  const durationInSeconds = Math.floor((Date.now() - start) / 1000)
  console.log(`brezel apply took: ${durationInSeconds} second(s)`)

  if (exitCode === 0) {
    sendLinuxNotification(
      "Apply is done",
      `The changes from brezel apply should be visible. It took ${durationInSeconds} second(s).`,
    )
  }

  return exitCode
}
