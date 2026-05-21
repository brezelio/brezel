import { assertNoArgs } from "../lib/validation"
import { brezelLogo, centerLine, createLogoShimmerController, createScreenRenderer, renderLogoLine } from "../lib/ui"

export async function runAnimateCommand(args: string[]): Promise<number> {
  if (!assertNoArgs("brezel animate", args)) {
    return 1
  }

  if (!process.stdout.isTTY) {
    for (const line of brezelLogo) {
      console.log(line)
    }
    return 0
  }

  let cleanedUp = false
  const screenRenderer = createScreenRenderer()
  const shimmer = createLogoShimmerController(() => render())

  const cleanup = () => {
    if (cleanedUp) {
      return
    }

    cleanedUp = true
    screenRenderer.cleanup()
    process.stdout.write("\n")
  }

  const render = () => {
    const terminalHeight = process.stdout.rows || 24
    const topPadding = Math.max(0, Math.floor((terminalHeight - brezelLogo.length) / 2))
    const lines: string[] = []

    for (let index = 0; index < topPadding; index += 1) {
      lines.push("")
    }

    for (const [index, line] of brezelLogo.entries()) {
      lines.push(centerLine(renderLogoLine(line, index, shimmer.getFrame())))
    }

    screenRenderer.render(lines)
  }

  const onResize = () => {
    screenRenderer.reset()
    render()
  }

  const handleProcessExit = () => cleanup()

  process.stdout.on("resize", onResize)
  process.once("exit", handleProcessExit)
  render()
  shimmer.start()

  return await new Promise<number>((resolve) => {
    const finish = (code: number) => {
      shimmer.stop()
      process.removeListener("SIGINT", handleSignal)
      process.removeListener("SIGTERM", handleSignal)
      process.stdout.removeListener("resize", onResize)
      process.removeListener("exit", handleProcessExit)
      cleanup()
      resolve(code)
    }

    const handleSignal = () => finish(0)

    process.on("SIGINT", handleSignal)
    process.on("SIGTERM", handleSignal)
  })
}
