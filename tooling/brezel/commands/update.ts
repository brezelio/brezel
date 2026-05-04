import { runBakeryArgs } from "../lib/bakery"
import { sendLinuxNotification } from "../lib/notifications"

export function runUpdateCommand(args: string[]): number {
  if (args.length > 0) {
    console.error("brezel update does not accept additional arguments.")
    return 1
  }

  const start = Date.now()

  console.log("bakery migrations...")
  let exitCode = runBakeryArgs(["migrate", "--force"])
  if (exitCode !== 0) {
    return exitCode
  }

  console.log("bakery load...")
  exitCode = runBakeryArgs(["load"])
  if (exitCode !== 0) {
    return exitCode
  }

  console.log("bakery apply...")
  exitCode = runBakeryArgs(["apply"])

  const durationInSeconds = Math.floor((Date.now() - start) / 1000)
  console.log(`brezel update took: ${durationInSeconds} second(s)`)

  if (exitCode === 0) {
    sendLinuxNotification(
      "Update is done",
      `The changes from brezel update should be visible. It took ${durationInSeconds} second(s).`,
    )
  }

  return exitCode
}
