/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonlyVITE_TURNSTILE_SITE_KEY?: string
}

interface ImportMeta {
  readonlyenv: ImportMetaEnv
}

export interface TurnstileRenderOptions {
  sitekey: string
  theme?: "dark" | "light" | "auto"
  language?: string
  callback?: (token: string) => void
  "error-callback"?: (errorCode?: string) => void
  "expired-callback"?: () => void
}

export interface TurnstileInstance {
  render: (
    container: string | HTMLElement,
    options: TurnstileRenderOptions,
  ) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance
  }
}
