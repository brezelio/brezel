import { runComposeCommandStreamingCaptured } from "../lib/compose"
import { buildCommandOutput } from "../lib/output"
import { assertNoArgs } from "../lib/validation"

export async function runStopCommand(args: string[]): Promise<number> {
  if (!assertNoArgs("brezel stop", args)) {
    return 1
  }

  console.log("Stopping the local Brezel Docker stack")

  const result = await runComposeCommandStreamingCaptured(["stop"], {
    profiles: ["db-explore"],
  })

  if (result.exitCode !== 0) {
    const output = buildCommandOutput("brezel stop", result.stdout, result.stderr, result.exitCode)
    for (const line of output.lines) {
      console.log(line)
    }
  }

  return result.exitCode
}
