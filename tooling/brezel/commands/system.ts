import { askQuestion } from "../lib/questions"
import { getSingleSystemIdentifier, isValidSystemIdentifier, renameSystem, slugifySystemIdentifier } from "../lib/system-config"
import { assertInteractiveTerminal } from "../lib/validation"

export async function runSystemCommand(args: string[]): Promise<number> {
  const [subcommand, ...rest] = args

  if (subcommand !== "initialize" || rest.length > 0) {
    console.error("Usage: brezel system initialize")
    return 1
  }

  if (!assertInteractiveTerminal("brezel system initialize")) {
    return 1
  }

  const currentIdentifier = getSingleSystemIdentifier()

  console.log("Brezel system initialization")
  console.log("")
  console.log("This step configures the semantic starting point of your Brezel system.")
  console.log("Strong recommendation: enter your company name.")
  console.log("If you answer 'no!', the example system stays bare and none of the nicer default customizations will be applied.")
  console.log("")

  const answer = await askQuestion("Company name (or 'no!' for a bare system): ")
  if (answer === null) {
    return 130
  }

  const companyName = answer.trim()
  if (!companyName) {
    console.log("No company name entered. Leaving the example system unchanged.")
    return 0
  }

  if (companyName.toLowerCase() === "no!") {
    console.log("Leaving the example system unchanged. You can customize it later.")
    return 0
  }

  const nextIdentifier = slugifySystemIdentifier(companyName)
  if (!nextIdentifier || !isValidSystemIdentifier(nextIdentifier)) {
    console.error("Could not derive a valid system identifier from that company name.")
    console.error("Try a simpler company name, or use 'no!' for a bare system.")
    return 1
  }

  if (nextIdentifier === currentIdentifier) {
    console.log(`System identifier already matches '${nextIdentifier}'. No rename needed.`)
    return 0
  }

  renameSystem(currentIdentifier, nextIdentifier)
  console.log(`Renamed system '${currentIdentifier}' to '${nextIdentifier}'.`)
  return 0
}
