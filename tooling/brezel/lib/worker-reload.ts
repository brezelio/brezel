import { existsSync, watch, type FSWatcher } from "node:fs"
import { join } from "node:path"
import { runBakeryArgsStreamingCaptured } from "./bakery"
import { getProjectDir } from "./exec"
import { readLinkState } from "./links"

const debounceMs = 1000

/**
 * Queue workers keep PHP code in memory, unlike the app container (opcache revalidates) and the scheduler
 * (fresh process per run). Gracefully restart them whenever backend PHP code changes.
 */
export function startWorkerReloadWatcher(): () => void {
  const directories = getWatchedDirectories().filter((directory) => existsSync(directory))
  let timer: ReturnType<typeof setTimeout> | null = null
  let restarting = false
  let pending = false

  const restartWorkers = async () => {
    if (restarting) {
      pending = true
      return
    }

    restarting = true
    await runBakeryArgsStreamingCaptured(["queue:restart"], { mirrorStdout: false, mirrorStderr: false })
    restarting = false

    if (pending) {
      pending = false
      await restartWorkers()
    }
  }

  const watchers: FSWatcher[] = directories.map((directory) => watch(directory, { recursive: true }, (_event, filename) => {
    if (!filename?.endsWith(".php")) {
      return
    }

    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => void restartWorkers(), debounceMs)
  }))

  return () => {
    if (timer) {
      clearTimeout(timer)
    }
    for (const watcher of watchers) {
      watcher.close()
    }
  }
}

function getWatchedDirectories(): string[] {
  const directories = [join(getProjectDir(), "app")]
  const linkedApi = readLinkState().api

  if (linkedApi) {
    directories.push(join(linkedApi, "app"), join(linkedApi, "config"), join(linkedApi, "routes"))
  }

  return directories
}
