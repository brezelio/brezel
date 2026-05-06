import { assertNoArgs } from "../lib/validation"
import { brezelLogo, centerLine, maxLogoWidth, renderLogoLine } from "../lib/ui"

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

  let shimmerFrame = 0
  let cleanedUp = false

  const cleanup = () => {
    if (cleanedUp) {
      return
    }

    cleanedUp = true
    process.stdout.write("\u001b[?25h")
    process.stdout.write("\u001b[0m")
    process.stdout.write("\n")
  }

  const render = () => {
    console.clear()

    const terminalHeight = process.stdout.rows || 24
    const topPadding = Math.max(0, Math.floor((terminalHeight - brezelLogo.length) / 2))
    for (let index = 0; index < topPadding; index += 1) {
      console.log("")
    }

    for (const [index, line] of brezelLogo.entries()) {
      console.log(centerLine(renderLogoLine(line, index, shimmerFrame)))
    }
  }

  process.stdout.write("\u001b[?25l")
  render()

  const timer = setInterval(() => {
    shimmerFrame = (shimmerFrame + 1) % (maxLogoWidth + 12)
    render()
  }, 120)

  return await new Promise<number>((resolve) => {
    const finish = (code: number) => {
      clearInterval(timer)
      process.removeListener("SIGINT", handleSignal)
      process.removeListener("SIGTERM", handleSignal)
      cleanup()
      resolve(code)
    }

    const handleSignal = () => finish(0)

    process.on("SIGINT", handleSignal)
    process.on("SIGTERM", handleSignal)
  })
}
