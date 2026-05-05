import { runBakeryArgs } from "./bakery"
import { sendLinuxNotification } from "./notifications"

type BakeryStep = {
  label: string
  args: string[]
}

export function runTimedBakerySequence(commandName: string, steps: BakeryStep[]): number {
  const start = Date.now()

  let exitCode = 0
  for (const step of steps) {
    console.log(step.label)
    exitCode = runBakeryArgs(step.args)
    if (exitCode !== 0) {
      return exitCode
    }
  }

  const durationInSeconds = Math.floor((Date.now() - start) / 1000)
  console.log(`${commandName} took: ${durationInSeconds} second(s)`)

  sendLinuxNotification(
    `${capitalize(commandName)} is done`,
    `The changes from ${commandName} should be visible. It took ${durationInSeconds} second(s).`,
  )

  return exitCode
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
