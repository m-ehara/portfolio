/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"

const ignorePrivateDataPlugin = (): Plugin => ({
  name: "ignore-private-data",
  load: (id) => {
    if (
      process.env.VITE_IGNORE_PRIVATE_DATA === "true" &&
      id.replace(/\\/g, "/").includes("/src/data/private/")
    ) {
      return "export {}"
    }
    return null
  },
})

export default defineConfig({
  plugins: [react(), ignorePrivateDataPlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/test/*.test.ts"],
    css: false,
  },
})
