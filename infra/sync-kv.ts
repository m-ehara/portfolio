import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { createServer } from "vite"
import { PORTFOLIO_KV_KEY } from "./worker.ts"

const OUTPUT_RELATIVE_PATH = ".wrangler/tmp/portfolio-data.json"

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
  const rootDir = process.cwd()
  const namespaceId = resolveKvNamespaceId(rootDir)
  if (!namespaceId) {
    throw new Error(
      "CLOUDFLARE_KV_NAMESPACE_ID is required. Set it in .dev.vars or environment variables.",
    )
  }

  const outputPath = path.resolve(rootDir, OUTPUT_RELATIVE_PATH)
  const hasPrivateProfile = existsSync(path.resolve(rootDir, "src/data/private/profile.ts"))

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
      throw new Error("Failed to load portfolioData from src/data/portfolioData.ts")
    }

    const serialized = `${JSON.stringify(mod.portfolioData, null, 2)}\n`
    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, serialized, "utf8")

    const sourceLabel = hasPrivateProfile ? "src/data/private/*" : "src/data/sample/*"
    console.log(
      `Exported ${sourceLabel} -> ${OUTPUT_RELATIVE_PATH} (${Buffer.byteLength(serialized, "utf8")} bytes)`,
    )
  } finally {
    await server.close()
  }

  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "kv",
      "key",
      "put",
      `--namespace-id=${namespaceId}`,
      PORTFOLIO_KV_KEY,
      `--path=${outputPath}`,
      "--remote",
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

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
