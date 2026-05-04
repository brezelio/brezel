import { createServer } from "node:net"

export async function portIsBusy(port: number): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    const server = createServer()

    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        resolve(true)
        return
      }

      resolve(false)
    })

    server.once("listening", () => {
      server.close(() => resolve(false))
    })

    server.listen(port, "0.0.0.0")
  })
}
