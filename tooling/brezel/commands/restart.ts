import { runComposeCommandStreamingCaptured } from "../lib/compose"
import { buildCommandOutput } from "../lib/output"
import { assertNoArgs } from "../lib/validation"

type RestartOptions = {
  mirrorStdout?: boolean
  mirrorStderr?: boolean
}

export async function runRestartCommand(args: string[]): Promise<number> {
  if (!assertNoArgs("brezel restart", args)) {
    return 1
  }

  return await restartStack()
}

export async function restartStack(options: RestartOptions = {}): Promise<number> {
  const mirrorStdout = options.mirrorStdout ?? true
  const mirrorStderr = options.mirrorStderr ?? true

  const steps: Array<{ title: string, args: string[] }> = [
    { title: "Stopping stack", args: ["down", "--remove-orphans"] },
    { title: "Starting stack", args: ["up", "-d", "--remove-orphans"] },
  ]

  for (const step of steps) {
    if (mirrorStdout) {
      console.log(step.title)
    }

    const result = await runComposeCommandStreamingCaptured(step.args, {
      profiles: ["db-explore"],
      mirrorStdout,
      mirrorStderr,
    })

    if (result.exitCode !== 0) {
      if (mirrorStdout || mirrorStderr) {
        const output = buildCommandOutput("brezel restart", result.stdout, result.stderr, result.exitCode)
        for (const line of output.lines) {
          console.log(line)
        }
      }

      return result.exitCode
    }
  }

  return 0
}
