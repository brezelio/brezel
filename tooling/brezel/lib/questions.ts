import { createInterface } from "node:readline"

export type ChoiceOption<T extends string> = {
  value: T
  label: string
}

export async function askQuestion(prompt: string): Promise<string> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return await new Promise<string>((resolve) => {
    readline.question(prompt, (answer) => {
      readline.close()
      resolve(answer)
    })
  })
}

export async function askYesNo(question: string, defaultValue: boolean): Promise<boolean> {
  const defaultLabel = defaultValue ? "Y/n" : "y/N"

  while (true) {
    const answer = (await askQuestion(`${question} [${defaultLabel}] `)).trim().toLowerCase()
    if (!answer) {
      return defaultValue
    }
    if (["y", "yes"].includes(answer)) {
      return true
    }
    if (["n", "no"].includes(answer)) {
      return false
    }
  }
}

export async function askChoice<T extends string>(question: string, choices: Array<T | ChoiceOption<T>>): Promise<T> {
  const normalizedChoices = choices.map((choice) => typeof choice === "string"
    ? { value: choice, label: choice }
    : choice)

  while (true) {
    console.log(question)
    for (const [index, choice] of normalizedChoices.entries()) {
      console.log(`  ${index + 1}. ${choice.label}`)
    }

    const answer = (await askQuestion("Choose an option: ")).trim().toLowerCase()
    const selectedIndex = Number(answer)
    if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= normalizedChoices.length) {
      return normalizedChoices[selectedIndex - 1].value
    }

    const match = normalizedChoices.find((choice) => choice.value.toLowerCase() === answer)
    if (match) {
      return match.value
    }

    console.log("Please choose one of the listed options.")
  }
}
