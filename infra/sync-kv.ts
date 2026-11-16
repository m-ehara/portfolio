import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { createServer } from "vite"
import { PORTFOLIO_KV_KEY } from "./worker.ts"

const OUTPUT_RELATIVE_PATH = ".wrangler/tmp/portfolio-data.json"

type PutMode = "local" | "remote" | null

const parsePutMode = (argv: string[]): PutMode => {
  const putArg = argv.find((arg) => arg.startsWith("--put="))
  if (!putArg) {
    return null
  }
  const mode = putArg.slice("--put=".length)
  if (mode === "local" || mode === "remote") {
    return mode
  }
  throw new Error(
    `Invalid --put mode: "${mode}". Use --put=local or --put=remote.`,
  )
}

const resolveKvNamespaceId = (rootDir: string): string | null => {
  const envValue = process.env.CLOUDFLARE_KV_NAMESPACE_ID?.trim()
  if (envValue) {
    return envValue
  }

  const devVarsPath = path.resolve(rootDir, ".dev.vars")
  if (!existsSync(devVarsPath)) {
    return null
  }

  const content = readFileSync(devVarsPath, "utf8")
  const match = content.match(/^CLOUDFLARE_KV_NAMESPACE_ID=(.+)$/m)
  if (!match?.[1]) {
    return null
  }

  const rawValue = match[1].trim().replace(/^["']|["']$/g, "")
  return rawValue || null
}

const main = async (): Promise<void> => {
  const putMode = parsePutMode(process.argv.slice(2))
  const rootDir = process.cwd()
  const outputPath = path.resolve(rootDir, OUTPUT_RELATIVE_PATH)
  const hasPrivateProfile = existsSync(
    path.resolve(rootDir, "src/data/private/profile.ts"),
  )

  const server = await createServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  })

  try {
    const mod = (await server.ssrLoadModule("/src/data/portfolioData.ts")) as {
      portfolioData?: unknown
    }
    if (!mod.portfolioData) {
      throw new Error(
        "Failed to load portfolioData from src/data/portfolioData.ts",
      )
    }

    const serialized = `${JSON.stringify(mod.portfolioData, null, 2)}\n`
    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, serialized, "utf8")

    const sourceLabel = hasPrivateProfile
      ? "src/data/private/*"
      : "src/data/sample/*"
    console.log(
      `Exported ${sourceLabel} -> ${OUTPUT_RELATIVE_PATH} (${Buffer.byteLength(serialized, "utf8")} bytes)`,
    )
  } finally {
    await server.close()
  }

  if (putMode) {
    const targetFlag = putMode === "remote" ? "--remote" : "--local"
    const namespaceId =
      putMode === "remote" ? resolveKvNamespaceId(rootDir) : null
    const targetBindingArg = namespaceId
      ? `--namespace-id=${namespaceId}`
      : "--binding=PORTFOLIO_KV"

    const result = spawnSync(
      "pnpm",
      [
        "exec",
        "wrangler",
        "kv",
        "key",
        "put",
        targetBindingArg,
        PORTFOLIO_KV_KEY,
        `--path=${outputPath}`,
        targetFlag,
      ],
      {
        cwd: rootDir,
        stdio: "inherit",
      },
    )

    if (result.status !== 0) {
      process.exit(result.status ?? 1)
    }
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
