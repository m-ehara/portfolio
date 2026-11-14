import { useEffect, useRef, useState } from "react"
import { AboutSection } from "./components/AboutSection"
import { Footer } from "./components/Footer"
import { Header } from "./components/Header"
import { HeroSection } from "./components/HeroSection"
import { ProjectsSection } from "./components/ProjectsSection"
import { ResumeSheetView } from "./components/ResumeSheetView"
import { SkillsSection } from "./components/SkillsSection"
import { TurnstileGate } from "./components/TurnstileGate"
import {
  PORTFOLIO_DATA_STORAGE_KEY,
  TURNSTILE_VERIFY_STORAGE_KEY,
  parsePortfolioData,
  portfolioData,
} from "./data/portfolioData"
import type {
  Locale,
  PortfolioData,
  ThemeMode,
  ViewMode,
} from "./types/portfolio"

const getInitialTurnstileVerified = (): boolean => {
  try {
    return (
      window.sessionStorage.getItem(TURNSTILE_VERIFY_STORAGE_KEY) === "true"
    )
  } catch {
    return false
  }
}

const readCachedPortfolioData = (): PortfolioData | null => {
  try {
    const raw = window.sessionStorage.getItem(PORTFOLIO_DATA_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    return parsePortfolioData(parsed)
  } catch {
    return null
  }
}

const persistPortfolioData = (value: PortfolioData): void => {
  try {
    window.sessionStorage.setItem(
      PORTFOLIO_DATA_STORAGE_KEY,
      JSON.stringify(value),
    )
  } catch {
    // Ignore sessionStorage quota or access errors
  }
}

export const App = () => {
  const [locale, setLocale] = useState<Locale>("ja")
  const [theme, setTheme] = useState<ThemeMode>("dark")
  const [viewMode, setViewMode] = useState<ViewMode>("interactive")
  const [selectedTech, setSelectedTech] = useState<string>("all")
  const [isTurnstileVerified, setIsTurnstileVerified] = useState<boolean>(
    getInitialTurnstileVerified,
  )
  const [data, setData] = useState<PortfolioData>(
    () => readCachedPortfolioData() ?? portfolioData,
  )
  const initialVerifiedRef = useRef<boolean>(isTurnstileVerified)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    document.title = `${data.name[locale]} | ${data.jobTitle[locale]}`
  }, [data, locale])

  useEffect(() => {
    if (!initialVerifiedRef.current || readCachedPortfolioData() !== null) {
      return
    }

    let cancelled = false
    const syncRemotePortfolioData = async () => {
      try {
        const response = await fetch("/api/portfolio")
        if (
          !response.ok ||
          !response.headers.get("content-type")?.includes("application/json")
        ) {
          return
        }
        const payload = (await response.json()) as {
          portfolioData?: unknown
        }
        const remoteData = parsePortfolioData(payload.portfolioData)
        if (!cancelled && remoteData) {
          setData(remoteData)
          persistPortfolioData(remoteData)
        }
      } catch {
        // Ignore network/404 errors when Worker KV is not configured
      }
    }

    void syncRemotePortfolioData()
    return () => {
      cancelled = true
    }
  }, [])

  const handleVerified = (remoteData?: PortfolioData) => {
    const validRemoteData = parsePortfolioData(remoteData)
    if (validRemoteData) {
      setData(validRemoteData)
      persistPortfolioData(validRemoteData)
    }
    setIsTurnstileVerified(true)
  }

  const handleSelectTech = (tech: string) => {
    setSelectedTech((prev) => (prev === tech ? "all" : tech))
    if (tech !== "all") {
      const el = document.getElementById("projects")
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const handlePrint = () => {
    if (viewMode !== "resume") {
      setViewMode("resume")
      setTimeout(() => {
        window.print()
      }, 150)
    } else {
      window.print()
    }
  }

  if (!isTurnstileVerified) {
    return (
      <TurnstileGate
        data={data}
        locale={locale}
        onToggleLocale={() => setLocale((l) => (l === "ja" ? "en" : "ja"))}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onVerified={handleVerified}
      />
    )
  }

  return (
    <div className="app-shell">
      <Header
        data={data}
        locale={locale}
        onToggleLocale={() => setLocale((l) => (l === "ja" ? "en" : "ja"))}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onPrint={handlePrint}
      />

      <main>
        {viewMode === "interactive" ? (
          <>
            <HeroSection
              data={data}
              locale={locale}
              onSelectTech={handleSelectTech}
              onChangeViewMode={setViewMode}
            />
            <AboutSection data={data} locale={locale} />
            <SkillsSection
              skills={data.skills}
              locale={locale}
              selectedTech={selectedTech}
              onSelectTech={handleSelectTech}
            />
            <ProjectsSection
              projects={data.projects}
              locale={locale}
              selectedTech={selectedTech}
              onSelectTech={setSelectedTech}
            />
          </>
        ) : (
          <ResumeSheetView data={data} locale={locale} onPrint={handlePrint} />
        )}
      </main>

      <Footer data={data} />
    </div>
  )
}

export default App
