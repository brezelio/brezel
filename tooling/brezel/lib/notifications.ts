import { spawnSync } from "node:child_process"

export function sendLinuxNotification(summary: string, body: string): void {
  if (process.platform !== "linux") {
    return
  }

  spawnSync("notify-send", ["-a", "Brezel Bakery", summary, body], {
    stdio: "ignore",
  })
}
