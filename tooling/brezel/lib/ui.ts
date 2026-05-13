export type CommandOutput = {
  title: string
  lines: string[]
  success: boolean
  live?: boolean
}

export type ScreenRenderer = {
  render: (lines: string[]) => void
  reset: () => void
  cleanup: () => void
}

export const ansi = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
} as const

export const brezelLogo = [
  "             ,@@**             ",
  "         .&@@@@&*****,         ",
  "      (&&&@@@@@&********       ",
  "   %&&&&&&&&@@@&********       ",
  "&&&&&&&&&&&&&&&&********       ",
  "%%%%&&&&&&&&*   ,,,*****       ",
  "%%%%%%%&(      /,,,,,,,*       ",
  "%%%%%%%#       *,,,,,,,,***    ",
  "#%%%%%%#         ,,,,,,,*******",
  "#######%#             ,&/******",
  "#######%%%%%.      &&&&@@@@#***",
  "#######%%%%%%%%*&&&&&&&@@@@@@@#",
  "  ,####%%%%%%%%&&&&&&&&@@@@@%  ",
  "      /%%%%%%%%&&&&&&&&@%.     ",
  "         ,%%%%%&&&&&&*         ",
] as const

export const maxLogoWidth = Math.max(...brezelLogo.map((line) => line.length))

export function paint(...codes: string[]): string {
  if (!process.stdout.isTTY) {
    return ""
  }

  return codes.join("")
}

export function paintReset(): string {
  if (!process.stdout.isTTY) {
    return ""
  }

  return ansi.reset
}

export function stripAnsi(value: string): string {
  return value
    .replace(/\u001b\[[0-9;]*m/g, "")
    .replace(/\u001b\]8;;.*?(\u0007|\u001b\\)/g, "")
}

export function rgb(red: number, green: number, blue: number): string {
  return `\u001b[38;2;${red};${green};${blue}m`
}

export function hotkey(key: string): string {
  return `${paint(ansi.bold, ansi.cyan)}[${key}]${paintReset()}`
}

export function hyperlink(url: string, label: string = url): string {
  if (!process.stdout.isTTY) {
    return label
  }

  return `]8;;${url}${label}]8;;`
}

export function statusLine(parts: string[]): string {
  return `${paint(ansi.dim)}${parts.join("  |  ")}${paintReset()}`
}

export function centerLine(line: string): string {
  if (!process.stdout.isTTY) {
    return line
  }

  const terminalWidth = process.stdout.columns || 80
  const visibleLength = stripAnsi(line).length

  if (visibleLength >= terminalWidth) {
    return line
  }

  return `${" ".repeat(Math.floor((terminalWidth - visibleLength) / 2))}${line}`
}

export function padVisible(line: string, width: number): string {
  const visibleLength = stripAnsi(line).length
  if (visibleLength >= width) {
    return line
  }

  return `${line}${" ".repeat(width - visibleLength)}`
}

export function renderInlineBox(line: string): string[] {
  return renderInlineBoxLines([line])
}

export function renderInlineBoxLines(lines: string[]): string[] {
  const maxContentWidth = getMaxBoxContentWidth()
  const wrappedLines = lines.flatMap((line) => wrapVisibleLine(line, maxContentWidth))
  const visibleWidth = wrappedLines.reduce((max, line) => Math.max(max, stripAnsi(line).length), 0)
  const horizontal = "─".repeat(visibleWidth + 2)

  return [
    `${paint(ansi.dim)}┌${horizontal}┐${paintReset()}`,
    ...wrappedLines.map((line) => `${paint(ansi.dim)}│ ${paintReset()}${padVisible(line, visibleWidth)}${paint(ansi.dim)} │${paintReset()}`),
    `${paint(ansi.dim)}└${horizontal}┘${paintReset()}`,
  ]
}

export function renderCommandOutputBlock(output: CommandOutput, labels: { live: string, complete: string }): string[] {
  const maxLines = 12
  const visibleLines = output.lines.length > maxLines
    ? [`... showing last ${maxLines} lines of ${output.lines.length}`, ...output.lines.slice(-maxLines)]
    : output.lines

  const statusColor = output.success ? ansi.green : ansi.yellow
  const prefix = output.live ? labels.live : labels.complete
  const header = `${paint(statusColor, ansi.bold)}${prefix}:${paintReset()} ${output.title}`

  return renderInlineBoxLines([header, "", ...(visibleLines.length > 0 ? visibleLines : ["No output yet."])])
}

export function renderLogoLine(line: string, row: number, shimmerFrame: number): string {
  if (!process.stdout.isTTY) {
    return line
  }

  let rendered = ""
  let activeColor = ""
  const shimmerCenter = (shimmerFrame % (maxLogoWidth + 18)) - 8 + row * 0.8

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextColor = getLogoCharacterColor(character, index, shimmerCenter)

    if (nextColor !== activeColor) {
      rendered += nextColor || ansi.reset
      activeColor = nextColor
    }

    rendered += character
  }

  return `${rendered}${ansi.reset}`
}

export function isPrintableInput(value: string): boolean {
  return !/[\u0000-\u001f\u007f]/.test(value)
}

export function createScreenRenderer(): ScreenRenderer {
  let previousLines: string[] = []
  let initialized = false

  return {
    render(lines: string[]) {
      if (!process.stdout.isTTY) {
        process.stdout.write(`${lines.join("\n")}\n`)
        previousLines = lines.slice()
        return
      }

      const updates: string[] = []

      if (!initialized) {
        updates.push("\u001b[?25l\u001b[2J")
        initialized = true
      }

      const maxLineCount = Math.max(previousLines.length, lines.length)

      for (let index = 0; index < maxLineCount; index += 1) {
        const nextLine = lines[index]
        const previousLine = previousLines[index]

        if (nextLine === previousLine) {
          continue
        }

        updates.push(`\u001b[${index + 1};1H\u001b[2K`)
        if (typeof nextLine === "string") {
          updates.push(nextLine)
        }
      }

      if (updates.length > 0) {
        updates.push("\u001b[1;1H")
        process.stdout.write(updates.join(""))
      }

      previousLines = lines.slice()
    },

    reset() {
      previousLines = []

      if (!process.stdout.isTTY || !initialized) {
        return
      }

      process.stdout.write("\u001b[2J\u001b[H")
    },

    cleanup() {
      previousLines = []

      if (!process.stdout.isTTY || !initialized) {
        return
      }

      process.stdout.write("\u001b[0m\u001b[?25h")
      initialized = false
    },
  }
}

function getLogoCharacterColor(character: string, column: number, shimmerCenter: number): string {
  const baseColor = getLogoCharacterRgb(character)
  if (!baseColor) {
    return ""
  }

  const distance = Math.abs(column - shimmerCenter)
  const shimmerWidth = 5
  const shimmerStrength = Math.max(0, 1 - distance / shimmerWidth)
  const [red, green, blue] = applyShimmer(baseColor, shimmerStrength)
  return rgb(red, green, blue)
}

function getLogoCharacterRgb(character: string): [number, number, number] | null {
  switch (character) {
    case "@":
      return [255, 214, 13]
    case "&":
      return [255, 166, 32]
    case "%":
      return [255, 70, 84]
    case "#":
      return [176, 64, 72]
    case "*":
      return [232, 62, 62]
    case ",":
    case ".":
    case "/":
    case "(":
    case ")":
      return [196, 84, 84]
    default:
      return null
  }
}

function applyShimmer(color: [number, number, number], strength: number): [number, number, number] {
  if (strength <= 0) {
    return color
  }

  const glow = 0.45 * strength
  return [
    blendChannel(color[0], 255, glow),
    blendChannel(color[1], 248, glow),
    blendChannel(color[2], 220, glow),
  ]
}

function blendChannel(base: number, target: number, amount: number): number {
  return Math.round(base + (target - base) * amount)
}

function getMaxBoxContentWidth(): number {
  const terminalWidth = process.stdout.columns || 80
  const boxWidth = Math.floor(terminalWidth * 0.9)
  return Math.max(24, boxWidth - 4)
}

function wrapVisibleLine(line: string, width: number): string[] {
  const plain = stripAnsi(line)
  if (!plain || plain.length <= width) {
    return [line]
  }

  const words = plain.split(/(\s+)/).filter((part) => part.length > 0)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    if (word.trim().length === 0) {
      if (current.length > 0 && current.length + word.length <= width) {
        current += word
      }
      continue
    }

    if (word.length > width) {
      if (current.length > 0) {
        lines.push(current.trimEnd())
        current = ""
      }

      for (let offset = 0; offset < word.length; offset += width) {
        lines.push(word.slice(offset, offset + width))
      }
      continue
    }

    const candidate = current.length > 0 ? `${current}${word}` : word
    if (candidate.length <= width) {
      current = candidate
      continue
    }

    if (current.length > 0) {
      lines.push(current.trimEnd())
    }
    current = word
  }

  if (current.length > 0) {
    lines.push(current.trimEnd())
  }

  return lines.length > 0 ? lines : [""]
}
