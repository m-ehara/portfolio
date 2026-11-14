import { createElement } from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import App from "../App"
import { Footer } from "../components/Footer"
import {
  CAREER_START,
  FREELANCE_START,
  PORTFOLIO_DATA_STORAGE_KEY,
  TURNSTILE_VERIFY_STORAGE_KEY,
  buildProjectPeriod,
  calculateDurationMonths,
  calculateElapsedYears,
  filterProjects,
  filterSkills,
  formatDurationLabel,
  formatElapsedYearsLabel,
  formatYearMonthSlash,
  portfolioData,
  samplePortfolioData,
} from "../data/portfolioData"
import type { PortfolioData } from "../types/portfolio"
import type { TurnstileRenderOptions } from "../vite-env"

describe("portfolioData & filter utilities", () => {
  it("loads valid portfolio data with projects and skills", () => {
    expect(portfolioData.projects.length).toBeGreaterThanOrEqual(3)
    expect(portfolioData.skills.length).toBeGreaterThanOrEqual(5)
    expect(portfolioData.projects[0]?.title.ja).toBeTruthy()
    expect(portfolioData.projects[0]?.title.en).toBeTruthy()
  })

  it("filters skills by category, minimum rank, and search query", () => {
    const langSkills = filterSkills(portfolioData.skills, {
      category: "language",
    })
    expect(langSkills.some((s) => s.name === "TypeScript")).toBe(true)
    expect(langSkills.every((s) => s.category === "language")).toBe(true)

    const topSkills = filterSkills(portfolioData.skills, {
      minRank: "★",
    })
    expect(topSkills.every((s) => s.rank === "★")).toBe(true)

    const searched = filterSkills(portfolioData.skills, {
      query: "trpc",
    })
    expect(searched).toHaveLength(1)
    expect(searched[0]?.name).toBe("tRPC")
  })

  it("filters projects by role, technology, and search query", () => {
    const pmProjects = filterProjects(portfolioData.projects, {
      role: "PM",
    })
    expect(pmProjects.length).toBeGreaterThanOrEqual(1)
    expect(pmProjects.every((p) => p.roles.includes("PM"))).toBe(true)

    const trpcProjects = filterProjects(portfolioData.projects, {
      tech: "tRPC",
    })
    expect(trpcProjects).toHaveLength(1)
    expect(trpcProjects[0]?.id).toBe(1)

    const goProjects = filterProjects(portfolioData.projects, {
      query: "Golang",
    })
    expect(goProjects).toHaveLength(1)
    expect(goProjects[0]?.id).toBe(2)
  })

  it("calculates dynamic dates, elapsed years, and project durations accurately across boundary months and JST timezone", () => {
    expect(formatYearMonthSlash({ year: 2026, month: 1 })).toBe("2026/01")
    expect(formatYearMonthSlash({ year: 2026, month: 11 })).toBe("2026/11")

    const sampleStartA = { year: 2016, month: 11 }
    const sampleStartB = { year: 2020, month: 6 }

    // UTC 2026-10-31 15:30 is JST (Asia/Tokyo) 2026-11-01 00:30 -> must resolve to 2026/11
    const utcOct31Late = Date.UTC(2026, 9, 31, 15, 30, 0)
    expect(formatYearMonthSlash(utcOct31Late)).toBe("2026/11")
    expect(calculateElapsedYears(sampleStartA, utcOct31Late)).toBe(10)

    // Boundary month check before and at anniversary month
    expect(calculateElapsedYears(sampleStartA, { year: 2026, month: 10 })).toBe(
      9,
    )
    expect(calculateElapsedYears(sampleStartA, { year: 2026, month: 11 })).toBe(
      10,
    )
    expect(formatElapsedYearsLabel(10)).toEqual({
      ja: "10年+",
      en: "10+ yrs",
    })

    expect(calculateElapsedYears(sampleStartB, { year: 2026, month: 5 })).toBe(
      5,
    )
    expect(calculateElapsedYears(sampleStartB, { year: 2026, month: 6 })).toBe(
      6,
    )

    // Verify exported CAREER_START / FREELANCE_START align with portfolioData
    expect(CAREER_START).toEqual(portfolioData.careerStart)
    expect(FREELANCE_START).toEqual(portfolioData.freelanceStart)

    // Project period & inclusive month calculation
    const completed = buildProjectPeriod({ year: 2025, month: 2 }, {
      year: 2026,
      month: 3,
    })
    expect(completed).toEqual({
      period: {
        ja: "2025年2月 ～ 2026年3月",
        en: "Feb 2025 – Mar 2026",
      },
      durationMonths: 14,
      durationLabel: {
        ja: "14ヶ月間",
        en: "14 mos",
      },
    })

    // Ongoing project without end date
    const ongoing = buildProjectPeriod({ year: 2026, month: 4 }, undefined, {
      year: 2026,
      month: 11,
    })
    expect(ongoing).toEqual({
      period: {
        ja: "2026年4月 ～ 現在",
        en: "Apr 2026 – Present",
      },
      durationMonths: 8,
      durationLabel: {
        ja: "8ヶ月間",
        en: "8 mos",
      },
    })

    // Singular 1 month formatting
    expect(
      calculateDurationMonths({ year: 2026, month: 5 }, {
        year: 2026,
        month: 5,
      }),
    ).toBe(1)
    expect(formatDurationLabel(1)).toEqual({
      ja: "1ヶ月間",
      en: "1 mo",
    })
  })
})

describe("App component interactions", () => {
  afterEach(() => {
    delete window.turnstile
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("dynamically updates updatedAt, total experience years, and freelance years based on current date", () => {
    const fixedDate = new Date(2027, 6, 15) // 2027/07
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)

    const expectedTotalYears = calculateElapsedYears(
      portfolioData.careerStart,
      fixedDate,
    )
    const expectedFreelanceYears = calculateElapsedYears(
      portfolioData.freelanceStart,
      fixedDate,
    )

    render(createElement(App))
    expect(screen.getByText("更新日: 2027/07")).toBeInTheDocument()
    expect(screen.getByText(`${expectedTotalYears}年+`)).toBeInTheDocument()
    expect(screen.getByText(`${expectedFreelanceYears}年+`)).toBeInTheDocument()
  })

  it("renders hero, specialties, skills, and projects in Japanese by default", () => {
    render(createElement(App))
    expect(screen.getByText(portfolioData.jobTitle.ja)).toBeInTheDocument()
    expect(
      screen.getByText(portfolioData.projects[0]!.title.ja),
    ).toBeInTheDocument()
    expect(
      screen.getByText(portfolioData.projects[1]!.title.ja),
    ).toBeInTheDocument()
  })

  it("renders Footer component with brand name and tech stack credit", () => {
    render(createElement(Footer))
    expect(screen.getByText(portfolioData.name.en)).toBeInTheDocument()
    expect(screen.getByText(portfolioData.jobTitle.en)).toBeInTheDocument()
    expect(
      screen.getByText(
        "Built with TypeScript, React, Vite, Vitest, Oxlint & Oxfmt",
      ),
    ).toBeInTheDocument()
  })

  it("switches language between Japanese and English", () => {
    render(createElement(App))
    const langBtn = screen.getByRole("button", { name: "Toggle Language" })
    fireEvent.click(langBtn)

    expect(
      screen.getAllByText(portfolioData.jobTitle.en).length,
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByText(portfolioData.projects[0]!.title.en),
    ).toBeInTheDocument()
    expect(screen.queryByText("要件定義")).not.toBeInTheDocument()
    expect(screen.queryByText("実装・単体")).not.toBeInTheDocument()

    // Switch to Resume / Print View in English and verify phase labels are translated
    const resumeButtons = screen.getAllByText("Resume / Print View")
    fireEvent.click(resumeButtons[0]!)
    expect(screen.queryByText("要件定義")).not.toBeInTheDocument()
    expect(screen.queryByText("実装・単体")).not.toBeInTheDocument()
    expect(screen.getAllByText("Implementation").length).toBeGreaterThanOrEqual(
      1,
    )
  })

  it("toggles between interactive portfolio view and resume sheet print view", () => {
    render(createElement(App))
    const modeButtons = screen.getAllByText("職務経歴書モード")
    fireEvent.click(modeButtons[0]!)

    expect(screen.getByText("経歴・スキルシート")).toBeInTheDocument()
    expect(
      screen.getByText(
        `【業務経歴詳細（全${portfolioData.projects.length}案件）】`,
      ),
    ).toBeInTheDocument()
  })

  it("filters projects when a role filter button is clicked", () => {
    const pmProject = portfolioData.projects.find((p) => p.roles.includes("PM"))
    const nonPmProject = portfolioData.projects.find(
      (p) => !p.roles.includes("PM"),
    )
    expect(pmProject).toBeDefined()
    expect(nonPmProject).toBeDefined()

    render(createElement(App))
    const pmFilterBtn = screen.getByRole("button", { name: "PM" })
    fireEvent.click(pmFilterBtn)

    expect(screen.getByText(pmProject!.title.ja)).toBeInTheDocument()
    expect(screen.queryByText(nonPmProject!.title.ja)).not.toBeInTheDocument()
  })

  it("opens and closes the mobile hamburger menu when toggled or when an action is selected", () => {
    render(createElement(App))
    const menuBtn = screen.getByRole("button", { name: "Toggle Menu" })
    expect(menuBtn).toHaveAttribute("aria-expanded", "false")
    expect(
      screen.queryByRole("dialog", { name: "Mobile Navigation" }),
    ).not.toBeInTheDocument()

    // Open mobile menu
    fireEvent.click(menuBtn)
    expect(menuBtn).toHaveAttribute("aria-expanded", "true")
    expect(
      screen.getByRole("dialog", { name: "Mobile Navigation" }),
    ).toBeInTheDocument()

    // Click mobile nav link and verify menu closes
    const mobileNavLinks = screen.getByRole("navigation", {
      name: "Mobile Section Links",
    })
    const firstLink = mobileNavLinks.querySelector("a")
    expect(firstLink).not.toBeNull()
    fireEvent.click(firstLink!)
    expect(menuBtn).toHaveAttribute("aria-expanded", "false")
    expect(
      screen.queryByRole("dialog", { name: "Mobile Navigation" }),
    ).not.toBeInTheDocument()
  })

  it("opens and closes the QR code share modal with download links", () => {
    render(createElement(App))
    const qrBtn = screen.getByRole("button", { name: "Open QR Code Modal" })
    expect(
      screen.queryByRole("dialog", { name: "QR Code Modal" }),
    ).not.toBeInTheDocument()

    fireEvent.click(qrBtn)
    const modal = screen.getByRole("dialog", { name: "QR Code Modal" })
    expect(modal).toBeInTheDocument()
    expect(screen.getByText(portfolioData.portfolioUrl)).toBeInTheDocument()

    const closeBtn = screen.getByRole("button", { name: "閉じる" })
    fireEvent.click(closeBtn)
    expect(
      screen.queryByRole("dialog", { name: "QR Code Modal" }),
    ).not.toBeInTheDocument()
  })

  it("renders TurnstileGate when unverified and transitions to portfolio upon successful verification", async () => {
    window.sessionStorage.removeItem(TURNSTILE_VERIFY_STORAGE_KEY)

    let capturedOptions: TurnstileRenderOptions | undefined
    window.turnstile = {
      render: vi.fn((_container, options) => {
        capturedOptions = options
        return "widget-1"
      }),
      reset: vi.fn(),
      remove: vi.fn(),
    }

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ verified: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    render(createElement(App))

    expect(
      screen.getByRole("heading", { name: "セキュリティ確認" }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(portfolioData.projects[0]!.title.ja),
    ).not.toBeInTheDocument()

    // Switch language on the gate screen
    const langBtn = screen.getByRole("button", { name: "Toggle Language" })
    fireEvent.click(langBtn)
    expect(
      screen.getByRole("heading", { name: "Security Verification" }),
    ).toBeInTheDocument()

    // Simulate Turnstile widget issuing a token
    expect(capturedOptions?.callback).toBeDefined()
    await act(async () => {
      capturedOptions?.callback?.("mock-turnstile-token")
    })

    await waitFor(() => {
      expect(
        screen.getByText(portfolioData.projects[0]!.title.en),
      ).toBeInTheDocument()
    })
    expect(window.sessionStorage.getItem(TURNSTILE_VERIFY_STORAGE_KEY)).toBe(
      "true",
    )
  })

  it("renders portfolioData returned by Worker KV upon Turnstile verification and caches it in sessionStorage", async () => {
    window.sessionStorage.removeItem(TURNSTILE_VERIFY_STORAGE_KEY)

    const remoteData: PortfolioData = {
      ...samplePortfolioData,
      name: { ja: "KV テストユーザー", en: "KV Test User" },
      brandName: "KV.User",
      projects: [
        {
          ...samplePortfolioData.projects[0]!,
          title: { ja: "KV配信案件テスト", en: "KV Delivered Project Test" },
        },
      ],
    }

    let capturedOptions: TurnstileRenderOptions | undefined
    window.turnstile = {
      render: vi.fn((_container, options) => {
        capturedOptions = options
        return "widget-kv"
      }),
      reset: vi.fn(),
      remove: vi.fn(),
    }

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ verified: true, portfolioData: remoteData }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    )

    render(createElement(App))

    await act(async () => {
      capturedOptions?.callback?.("kv-token")
    })

    await waitFor(() => {
      expect(screen.getByText("KV配信案件テスト")).toBeInTheDocument()
    })
    expect(screen.getByText("KV テストユーザー")).toBeInTheDocument()
    expect(window.sessionStorage.getItem(PORTFOLIO_DATA_STORAGE_KEY)).toContain(
      "KV配信案件テスト",
    )
  })

  it("shows error alert and retry button when Turnstile verification fails", async () => {
    window.sessionStorage.removeItem(TURNSTILE_VERIFY_STORAGE_KEY)

    let capturedOptions: TurnstileRenderOptions | undefined
    const resetMock = vi.fn()
    window.turnstile = {
      render: vi.fn((_container, options) => {
        capturedOptions = options
        return "widget-err"
      }),
      reset: resetMock,
      remove: vi.fn(),
    }

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ verified: false }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    )

    render(createElement(App))
    await act(async () => {
      capturedOptions?.callback?.("bad-token")
    })

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "セキュリティ検証に失敗しました。もう一度お試しください。",
      )
    })

    const retryBtn = screen.getByRole("button", { name: "再試行する" })
    fireEvent.click(retryBtn)
    expect(resetMock).toHaveBeenCalledWith("widget-err")
  })
})
