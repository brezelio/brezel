import { createInterface } from "node:readline"

export type ChoiceOption<T extends string> = {
  value: T
  label: string
}

export async function askQuestion(prompt: string): Promise<string | null> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return await new Promise<string | null>((resolve) => {
    readline.on("SIGINT", () => {
      readline.close()
      resolve(null)
    })

    readline.question(prompt, (answer) => {
      readline.close()
      resolve(answer)
    })
  })
}

export async function askYesNo(question: string, defaultValue: boolean): Promise<boolean | null> {
  const defaultLabel = defaultValue ? "Y/n" : "y/N"

  while (true) {
    const answer = await askQuestion(`${question} [${defaultLabel}] `)
    if (answer === null) {
      return null
    }

    const normalizedAnswer = answer.trim().toLowerCase()
    if (!normalizedAnswer) {
      return defaultValue
    }
    if (["y", "yes"].includes(normalizedAnswer)) {
      return true
    }
    if (["n", "no"].includes(normalizedAnswer)) {
      return false
    }
  }
}

export async function askChoice<T extends string>(question: string, choices: Array<T | ChoiceOption<T>>): Promise<T | null> {
  const normalizedChoices = choices.map((choice) => typeof choice === "string"
    ? { value: choice, label: choice }
    : choice)

  while (true) {
    console.log(question)
    for (const [index, choice] of normalizedChoices.entries()) {
      console.log(`  ${index + 1}. ${choice.label}`)
    }

    const answer = await askQuestion("Choose an option: ")
    if (answer === null) {
      return null
    }

    const normalizedAnswer = answer.trim().toLowerCase()
    const selectedIndex = Number(normalizedAnswer)
    if (Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= normalizedChoices.length) {
      return normalizedChoices[selectedIndex - 1].value
    }

    const match = normalizedChoices.find((choice) => choice.value.toLowerCase() === normalizedAnswer)
    if (match) {
      return match.value
    }

    console.log("Please choose one of the listed options.")
  }
}
