export function assertNoArgs(commandName: string, args: string[]): boolean {
  if (args.length === 0) {
    return true
  }

  console.error(`${commandName} does not accept additional arguments.`)
  return false
}

export function assertInteractiveTerminal(commandName: string): boolean {
  if (process.stdin.isTTY && process.stdout.isTTY) {
    return true
  }

  console.error(`${commandName} requires an interactive terminal.`)
  return false
}
