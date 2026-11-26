import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  Globe,
  Loader2,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  Terminal,
} from "lucide-react"
import { TURNSTILE_DUMMY_SITE_KEY, TURNSTILE_SCRIPT_URL } from "../data/constants"
import { UI_TEXT } from "../data/i18n"
import styles from "../styles/modules/TurnstileGate.module.css"
import type { Locale, PortfolioData, ThemeMode } from "../types/portfolio"

interface TurnstileGateProps {
  locale: Locale
  onToggleLocale: () => void
  theme: ThemeMode
  onToggleTheme: () => void
  onVerified: (portfolioData?: PortfolioData) => void
}

type GateStatus = "idle" | "verifying" | "error"

export const TurnstileGate = ({
  locale,
  onToggleLocale,
  theme,
  onToggleTheme,
  onVerified,
}: TurnstileGateProps) => {
  const [status, setStatus] = useState<GateStatus>("idle")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const t = UI_TEXT[locale]

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || TURNSTILE_DUMMY_SITE_KEY

  const verifyToken = useCallback(
    async (token: string) => {
      setStatus("verifying")
      try {
        const response = await fetch("/api/turnstile/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        // Allow local pure Vite dev server (without Worker backend) to proceed when using dummy site key
        if (
          response.status === 404 &&
          import.meta.env.DEV &&
          !response.headers.get("content-type")?.includes("application/json")
        ) {
          onVerified()
          return
        }

        if (!response.ok) {
          setStatus("error")
          return
        }

        const resData = (await response.json()) as {
          verified?: boolean
          portfolioData?: PortfolioData
        }
        if (resData.verified) {
          onVerified(resData.portfolioData)
        } else {
          setStatus("error")
        }
      } catch {
        setStatus("error")
      }
    },
    [onVerified],
  )

  const removeWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch {
        // Ignore removal errors on stale widget IDs
      }
      widgetIdRef.current = null
    }
  }, [])

  const renderWidget = useCallback(() => {
    const container = containerRef.current
    const turnstile = window.turnstile
    if (!container || !turnstile) {
      return
    }

    removeWidget()
    setStatus("idle")

    container.innerHTML = ""
    widgetIdRef.current = turnstile.render(container, {
      sitekey: siteKey,
      theme,
      language: locale,
      callback: (token: string) => {
        void verifyToken(token)
      },
      "error-callback": () => {
        setStatus("error")
      },
      "expired-callback": () => {
        setStatus("idle")
      },
    })
  }, [locale, removeWidget, siteKey, theme, verifyToken])

  useEffect(() => {
    if (window.turnstile) {
      renderWidget()
      return () => {
        removeWidget()
      }
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT_URL}"]`)
    const handleLoad = () => {
      renderWidget()
    }

    if (!script) {
      script = document.createElement("script")
      script.src = TURNSTILE_SCRIPT_URL
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    script.addEventListener("load", handleLoad)

    return () => {
      script?.removeEventListener("load", handleLoad)
      removeWidget()
    }
  }, [removeWidget, renderWidget])

  const handleRetry = () => {
    setStatus("idle")
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current)
    } else {
      renderWidget()
    }
  }

  return (
    <div className={styles.gateScreen}>
      <header className={styles.topBar}>
        <div className={styles.brandGroup}>
          <span className={styles.brandIcon} aria-hidden="true">
            <Terminal size={18} />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Portfolio</span>
            <span className={styles.brandRole}>Security Gate</span>
          </span>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onToggleLocale}
            aria-label="Toggle Language"
            title={t.toggleLanguageTitle}
          >
            <Globe size={16} />
            <span className={styles.langCode}>{locale.toUpperCase()}</span>
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            title={theme === "dark" ? t.switchToLightTitle : t.switchToDarkTitle}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className={styles.centerWrap}>
        <section className={styles.gateCard} aria-labelledby="turnstile-gate-title">
          <div className={styles.shieldIconWrap} aria-hidden="true">
            <ShieldCheck size={26} />
          </div>
          <span className={styles.badge}>{t.turnstileBadge}</span>
          <h1 id="turnstile-gate-title" className={styles.title}>
            {t.turnstileTitle}
          </h1>
          <p className={styles.description}>{t.turnstileDesc}</p>

          <div
            ref={containerRef}
            className={styles.widgetContainer}
            data-testid="turnstile-widget-container"
          />

          {status === "verifying" && (
            <div className={styles.statusMessage} role="status">
              <Loader2 size={16} />
              <span>{t.turnstileVerifying}</span>
            </div>
          )}

          {status === "error" && (
            <div className={styles.errorBox} role="alert">
              <div className={styles.errorRow}>
                <AlertCircle size={16} />
                <span>{t.turnstileError}</span>
              </div>
              <button type="button" className={styles.retryBtn} onClick={handleRetry}>
                <RefreshCw size={14} />
                <span>{t.turnstileRetryBtn}</span>
              </button>
            </div>
          )}

          <div className={styles.footerNote}>{t.turnstileProtectedBy}</div>
        </section>
      </main>
    </div>
  )
}
