/// <reference types="vite/client" />

export interface TurnstileRenderOptions {
  sitekey: string
  theme?: "dark" | "light" | "auto"
  language?: string
  callback?: (token: string) => void
  "error-callback"?: (errorCode?: string) => void
  "expired-callback"?: () => void
}

interface TurnstileInstance {
  render: (
    container: string | HTMLElement,
    options: TurnstileRenderOptions,
  ) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface ImportMetaEnv {
    VITE_TURNSTILE_SITE_KEY?: string
  }

  interface Window {
    turnstile?: TurnstileInstance
  }
}
