export function runSetupCommand(args: string[]): number {
  if (args.length > 0) {
    console.error("brezel setup does not accept additional arguments yet.")
    return 1
  }

  console.log("Hello from brezel setup.")
  console.log("The interactive setup flow will be implemented in a later draft.")
  return 0
}
