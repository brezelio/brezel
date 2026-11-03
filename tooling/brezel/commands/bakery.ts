import { runBakeryArgs } from "../lib/bakery"

export function runBakeryCommand(args: string[]): number {
  return runBakeryArgs(args)
}
