import { basename } from "node:path"
import { spawn } from "node:child_process"

export async function runShellCommand(args: string[]): Promise<number> {
  if (args.length > 0) {
    console.error("brezel shell does not accept additional arguments.")
    return 1
  }

  console.log("Brezel project shell")
  console.log("Use Ctrl+Q to exit Brezel from Zellij cleanly, or the Docker containers may keep running causing port collisions when you start another Brezel!")
  console.log("Use the Brezel-CLI `brezel` to interact with your running Brezel from here.")
  console.log("(Or just interact with your system files using your favourite cli tools. This is just a shell after all.)")
  console.log("Commonly used commands such as `brezel bakery apply` or `brezel bakery update` are available as just `a` and `u` here in the project directory!")

  const { command, shellArgs } = getShellCommand()

  const child = spawn(command, shellArgs, {
    stdio: "inherit",
    env: process.env,
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

function getShellCommand(): { command: string, shellArgs: string[] } {
  if (process.platform === "win32") {
    return {
      command: process.env.COMSPEC || "cmd.exe",
      shellArgs: [],
    }
  }

  const command = process.env.SHELL || "sh"
  const shellName = basename(command)
  const shellArgs = ["bash", "zsh", "sh", "fish"].includes(shellName) ? ["-l"] : []

  return { command, shellArgs }
}
