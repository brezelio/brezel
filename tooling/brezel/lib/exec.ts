import { spawn, spawnSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const toolingDir = dirname(fileURLToPath(import.meta.url))
const projectDir = resolve(toolingDir, "../../..")

type ProjectCommand = {
  unixCommand: string
  windowsCommand: string
  args: string[]
  windowsArgs?: string[]
}

export type CapturedCommandResult = {
  exitCode: number
  stdout: string
  stderr: string
}

export type StreamingCaptureOptions = {
  mirrorStdout?: boolean
  mirrorStderr?: boolean
  onStdoutChunk?: (chunk: string) => void
  onStderrChunk?: (chunk: string) => void
}

export function getProjectDir(): string {
  return projectDir
}

export function runProjectCommand(command: ProjectCommand): number {
  const result = process.platform === "win32"
    ? spawnSync(command.windowsCommand, command.windowsArgs ?? command.args, {
        cwd: projectDir,
        stdio: "inherit",
      })
    : spawnSync(command.unixCommand, command.args, {
        cwd: projectDir,
        stdio: "inherit",
      })

  if (result.error) {
    console.error(result.error.message)
    return 1
  }

  return result.status ?? 0
}

export function runProjectCommandCaptured(command: ProjectCommand): CapturedCommandResult {
  const result = process.platform === "win32"
    ? spawnSync(command.windowsCommand, command.windowsArgs ?? command.args, {
        cwd: projectDir,
        encoding: "utf-8",
        stdio: ["inherit", "pipe", "pipe"],
      })
    : spawnSync(command.unixCommand, command.args, {
        cwd: projectDir,
        encoding: "utf-8",
        stdio: ["inherit", "pipe", "pipe"],
      })

  if (result.error) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: result.error.message,
    }
  }

  return {
    exitCode: result.status ?? 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  }
}

export async function runProjectCommandCapturedAsync(command: ProjectCommand): Promise<CapturedCommandResult> {
  const child = process.platform === "win32"
    ? spawn(command.windowsCommand, command.windowsArgs ?? command.args, {
        cwd: projectDir,
        stdio: ["inherit", "pipe", "pipe"],
      })
    : spawn(command.unixCommand, command.args, {
        cwd: projectDir,
        stdio: ["inherit", "pipe", "pipe"],
      })

  let stdout = ""
  let stderr = ""

  child.stdout?.on("data", (chunk) => {
    stdout += chunk.toString()
  })

  child.stderr?.on("data", (chunk) => {
    stderr += chunk.toString()
  })

  return await new Promise<CapturedCommandResult>((resolve) => {
    child.on("error", (error) => {
      resolve({
        exitCode: 1,
        stdout,
        stderr: stderr ? `${stderr}\n${error.message}` : error.message,
      })
    })

    child.on("exit", (code, signal) => {
      resolve({
        exitCode: signal ? 130 : (code ?? 0),
        stdout,
        stderr,
      })
    })
  })
}

export async function runProjectCommandInteractive(command: ProjectCommand): Promise<number> {
  const child = process.platform === "win32"
    ? spawn(command.windowsCommand, command.windowsArgs ?? command.args, {
        cwd: projectDir,
        stdio: "inherit",
      })
    : spawn(command.unixCommand, command.args, {
        cwd: projectDir,
        stdio: "inherit",
      })

  return await new Promise<number>((resolve) => {
    child.on("error", (error) => {
      console.error(error.message)
      resolve(1)
    })

    child.on("exit", (code, signal) => {
      if (signal) {
        resolve(1)
        return
      }

      resolve(code ?? 0)
    })
  })
}

export async function runProjectCommandStreamingCaptured(command: ProjectCommand, options: StreamingCaptureOptions = {}): Promise<CapturedCommandResult> {
  const child = process.platform === "win32"
    ? spawn(command.windowsCommand, command.windowsArgs ?? command.args, {
        cwd: projectDir,
        stdio: ["inherit", "pipe", "pipe"],
      })
    : spawn(command.unixCommand, command.args, {
        cwd: projectDir,
        stdio: ["inherit", "pipe", "pipe"],
      })

  let stdout = ""
  let stderr = ""

  child.stdout?.on("data", (chunk) => {
    const text = chunk.toString()
    stdout += text
    options.onStdoutChunk?.(text)
    if (options.mirrorStdout !== false) {
      process.stdout.write(text)
    }
  })

  child.stderr?.on("data", (chunk) => {
    const text = chunk.toString()
    stderr += text
    options.onStderrChunk?.(text)
    if (options.mirrorStderr !== false) {
      process.stderr.write(text)
    }
  })

  return await new Promise<CapturedCommandResult>((resolve) => {
    child.on("error", (error) => {
      resolve({
        exitCode: 1,
        stdout,
        stderr: stderr ? `${stderr}\n${error.message}` : error.message,
      })
    })

    child.on("exit", (code, signal) => {
      resolve({
        exitCode: signal ? 130 : (code ?? 0),
        stdout,
        stderr,
      })
    })
  })
}
