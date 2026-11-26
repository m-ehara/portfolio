import { createElement } from "react"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import App from "../../src/App"
import { Footer } from "../../src/components/Footer"
import { SkillsSection } from "../../src/components/SkillsSection"
import { PORTFOLIO_DATA_STORAGE_KEY, TURNSTILE_VERIFY_STORAGE_KEY } from "../../src/data/constants"
import { portfolioData, samplePortfolioData } from "../../src/data/portfolioData"
import {
  buildProjectPeriod,
  calculateDurationMonths,
  calculateElapsedYears,
  formatDurationLabel,
  formatElapsedYearsLabel,
  formatYearMonthSlash,
} from "../../src/utils/date"
import { filterProjects, filterSkills, matchesTech } from "../../src/utils/filters"
import type { PortfolioData, ProjectItem, SkillItem } from "../../src/types/portfolio"
import type { TurnstileRenderOptions } from "../../src/vite-env"

describe("portfolioData & filter utilities", () => {
  it("loads valid portfolio data with projects and skills", () => {
    expect(portfolioData.projects.length).toBeGreaterThanOrEqual(3)
    expect(portfolioData.skills.length).toBeGreaterThanOrEqual(5)
    expect(portfolioData.projects[0]?.title.ja).toBeTruthy()
    expect(portfolioData.projects[0]?.title.en).toBeTruthy()
  })

  it("filters skills by category, minimum rank, and search query", () => {
    const langSkills = filterSkills(samplePortfolioData.skills, {
      category: "language",
    })
    expect(langSkills.some((s) => s.name === "TypeScript")).toBe(true)
    expect(langSkills.every((s) => s.category === "language")).toBe(true)

    const topSkills = filterSkills(samplePortfolioData.skills, {
      minRank: "★",
    })
    expect(topSkills.every((s) => s.rank === "★")).toBe(true)

    const searched = filterSkills(samplePortfolioData.skills, {
      query: "trpc",
    })
    expect(searched).toHaveLength(1)
    expect(searched[0]?.name).toBe("tRPC")
  })

  it("filters projects by role, technology, and search query", () => {
    const pmProjects = filterProjects(samplePortfolioData.projects, {
      role: "PM",
    })
    expect(pmProjects.length).toBeGreaterThanOrEqual(1)
    expect(pmProjects.every((p) => p.roles.includes("PM"))).toBe(true)

    const trpcProjects = filterProjects(samplePortfolioData.projects, {
      tech: "tRPC",
    })
    expect(trpcProjects).toHaveLength(1)
    expect(trpcProjects[0]?.id).toBe(1)

    const goProjects = filterProjects(samplePortfolioData.projects, {
      query: "Golang",
    })
    expect(goProjects).toHaveLength(1)
    expect(goProjects[0]?.id).toBe(2)
  })

  it("matches technologies by token boundary and normalization without false positives", () => {
    expect(matchesTech("JavaScript", "Java")).toBe(false)
    expect(matchesTech("Java", "JavaScript")).toBe(false)
    expect(matchesTech("MongoDB", "Go")).toBe(false)
    expect(matchesTech("Google Apps (G Suite)", "Go")).toBe(false)
    expect(matchesTech("SCSS", "CSS")).toBe(false)
    expect(matchesTech("Vitest", "Vite")).toBe(false)

    expect(matchesTech("React.js", "React")).toBe(true)
    expect(matchesTech("HTML5", "HTML")).toBe(true)
    expect(matchesTech("CSS3", "CSS")).toBe(true)
    expect(matchesTech("Amazon Linux", "Linux")).toBe(true)
    expect(matchesTech("AWS ECS", "AWS")).toBe(true)
    expect(matchesTech("Windows Server 2008", "Windows Server")).toBe(true)
    expect(matchesTech("GitHub", "Git / GitHub")).toBe(true)
    expect(matchesTech("Git(Backlog)", "Git / GitHub")).toBe(true)

    const baseProject = samplePortfolioData.projects[0]!
    const syntheticProjects: ProjectItem[] = [
      {
        ...baseProject,
        id: 101,
        languages: ["JavaScript"],
        databases: ["MongoDB"],
        serverOs: ["Amazon Linux"],
        frameworksAndTools: ["React.js"],
      },
      {
        ...baseProject,
        id: 102,
        languages: ["Java", "Go"],
        databases: ["PostgreSQL"],
        serverOs: ["Windows Server 2008"],
        frameworksAndTools: ["Google Apps (G Suite)"],
      },
    ]

    expect(filterProjects(syntheticProjects, { tech: "Java" }).map((p) => p.id)).toEqual([102])
    expect(filterProjects(syntheticProjects, { tech: "Go" }).map((p) => p.id)).toEqual([102])
    expect(filterProjects(syntheticProjects, { tech: "React" }).map((p) => p.id)).toEqual([101])
    expect(filterProjects(syntheticProjects, { tech: "Amazon Linux" }).map((p) => p.id)).toEqual([
      101,
    ])
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
    expect(calculateElapsedYears(sampleStartA, { year: 2026, month: 10 })).toBe(9)
    expect(calculateElapsedYears(sampleStartA, { year: 2026, month: 11 })).toBe(10)
    expect(formatElapsedYearsLabel(10)).toEqual({
      ja: "10年+",
      en: "10+ yrs",
    })

    expect(calculateElapsedYears(sampleStartB, { year: 2026, month: 5 })).toBe(5)
    expect(calculateElapsedYears(sampleStartB, { year: 2026, month: 6 })).toBe(6)

    // Verify portfolioData careerStart / freelanceStart have valid YearMonth structure
    expect(portfolioData.careerStart.year).toBeGreaterThanOrEqual(2000)
    expect(portfolioData.careerStart.month).toBeGreaterThanOrEqual(1)
    expect(portfolioData.careerStart.month).toBeLessThanOrEqual(12)
    expect(portfolioData.freelanceStart.year).toBeGreaterThanOrEqual(2000)
    expect(portfolioData.freelanceStart.month).toBeGreaterThanOrEqual(1)
    expect(portfolioData.freelanceStart.month).toBeLessThanOrEqual(12)

    // Project period & inclusive month calculation
    const completed = buildProjectPeriod(
      { year: 2025, month: 2 },
      {
        year: 2026,
        month: 3,
      },
    )
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
      calculateDurationMonths(
        { year: 2026, month: 5 },
        {
          year: 2026,
          month: 5,
        },
      ),
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

    const expectedTotalYears = calculateElapsedYears(portfolioData.careerStart, fixedDate)
    const expectedFreelanceYears = calculateElapsedYears(portfolioData.freelanceStart, fixedDate)

    render(createElement(App))
    expect(screen.getByText("更新日: 2027/07")).toBeInTheDocument()
    expect(screen.getByText(`${expectedTotalYears}年+`)).toBeInTheDocument()
    expect(screen.getByText(`${expectedFreelanceYears}年+`)).toBeInTheDocument()
  })

  it("renders hero, specialties, skills, and projects in Japanese by default", () => {
    render(createElement(App))
    expect(screen.getByText(portfolioData.jobTitle.ja)).toBeInTheDocument()
    expect(screen.getByText(portfolioData.projects[0]!.title.ja)).toBeInTheDocument()
    expect(screen.getByText(portfolioData.projects[1]!.title.ja)).toBeInTheDocument()
  })

  it("renders Footer component with brand name and tech stack credit", () => {
    render(createElement(Footer))
    expect(screen.getByText(portfolioData.name.en)).toBeInTheDocument()
    expect(screen.getByText(portfolioData.jobTitle.en)).toBeInTheDocument()
    expect(
      screen.getByText("Built with TypeScript, React, Vite, Vitest, Oxlint & Oxfmt"),
    ).toBeInTheDocument()
  })

  it("switches language between Japanese and English", () => {
    render(createElement(App))
    const langBtn = screen.getByRole("button", { name: "Toggle Language" })
    fireEvent.click(langBtn)

    expect(screen.getAllByText(portfolioData.jobTitle.en).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(portfolioData.projects[0]!.title.en)).toBeInTheDocument()
    expect(screen.queryByText("要件定義")).not.toBeInTheDocument()
    expect(screen.queryByText("実装・単体")).not.toBeInTheDocument()

    // Switch to Resume / Print View in English and verify phase labels are translated
    const resumeButtons = screen.getAllByText("Resume / Print View")
    fireEvent.click(resumeButtons[0]!)
    expect(screen.queryByText("要件定義")).not.toBeInTheDocument()
    expect(screen.queryByText("実装・単体")).not.toBeInTheDocument()
    expect(screen.getAllByText("Implementation").length).toBeGreaterThanOrEqual(1)
  })

  it("toggles between interactive portfolio view and resume sheet print view", () => {
    render(createElement(App))
    const modeButtons = screen.getAllByText("職務経歴書モード")
    fireEvent.click(modeButtons[0]!)

    expect(screen.getByText("経歴・スキルシート")).toBeInTheDocument()
    expect(
      screen.getByText(`【業務経歴詳細（全${portfolioData.projects.length}案件）】`),
    ).toBeInTheDocument()
  })

  it("filters projects when a role filter button is clicked", () => {
    const pmProject = portfolioData.projects.find((p) => p.roles.includes("PM"))
    const nonPmProject = portfolioData.projects.find((p) => !p.roles.includes("PM"))
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
    expect(screen.queryByRole("dialog", { name: "Mobile Navigation" })).not.toBeInTheDocument()

    // Open mobile menu
    fireEvent.click(menuBtn)
    expect(menuBtn).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("dialog", { name: "Mobile Navigation" })).toBeInTheDocument()

    // Click mobile nav link and verify menu closes
    const mobileNavLinks = screen.getByRole("navigation", {
      name: "Mobile Section Links",
    })
    const firstLink = mobileNavLinks.querySelector("a")
    expect(firstLink).not.toBeNull()
    fireEvent.click(firstLink!)
    expect(menuBtn).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("dialog", { name: "Mobile Navigation" })).not.toBeInTheDocument()
  })

  it("opens and closes the QR code share modal with download links", () => {
    render(createElement(App))
    const qrBtn = screen.getByRole("button", { name: "Open QR Code Modal" })
    expect(screen.queryByRole("dialog", { name: "QR Code Modal" })).not.toBeInTheDocument()

    fireEvent.click(qrBtn)
    const modal = screen.getByRole("dialog", { name: "QR Code Modal" })
    expect(modal).toBeInTheDocument()
    expect(screen.getByText(portfolioData.portfolioUrl)).toBeInTheDocument()

    const closeBtn = screen.getByRole("button", { name: "閉じる" })
    fireEvent.click(closeBtn)
    expect(screen.queryByRole("dialog", { name: "QR Code Modal" })).not.toBeInTheDocument()

    // Re-open and close with Escape key
    fireEvent.click(qrBtn)
    expect(screen.getByRole("dialog", { name: "QR Code Modal" })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("dialog", { name: "QR Code Modal" })).not.toBeInTheDocument()
  })

  it("includes serverOs options in the project tech filter select and keeps non-exact skill selections visible", () => {
    render(createElement(App))
    const techSelect = screen.getByRole("combobox", {
      name: "技術フィルタ",
    }) as HTMLSelectElement

    const firstOs = portfolioData.projects[0]!.serverOs[0]!
    expect(Array.from(techSelect.options).some((option) => option.value === firstOs)).toBe(true)

    fireEvent.change(techSelect, { target: { value: firstOs } })
    expect(techSelect.value).toBe(firstOs)
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

    expect(screen.getByRole("heading", { name: "セキュリティ確認" })).toBeInTheDocument()
    expect(screen.getByText("Portfolio")).toBeInTheDocument()
    expect(screen.getByText("Security Gate")).toBeInTheDocument()
    expect(screen.queryByText(samplePortfolioData.brandName)).not.toBeInTheDocument()
    expect(document.title).toBe("Portfolio & Skill Sheet")
    expect(screen.queryByText(portfolioData.projects[0]!.title.ja)).not.toBeInTheDocument()

    // Switch language on the gate screen
    const langBtn = screen.getByRole("button", { name: "Toggle Language" })
    fireEvent.click(langBtn)
    expect(screen.getByRole("heading", { name: "Security Verification" })).toBeInTheDocument()

    // Simulate Turnstile widget issuing a token
    expect(capturedOptions?.callback).toBeDefined()
    await act(async () => {
      capturedOptions?.callback?.("mock-turnstile-token")
    })

    await waitFor(() => {
      expect(screen.getByText(portfolioData.projects[0]!.title.en)).toBeInTheDocument()
    })
    expect(window.sessionStorage.getItem(TURNSTILE_VERIFY_STORAGE_KEY)).toBe("true")
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
      new Response(JSON.stringify({ verified: true, portfolioData: remoteData }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    render(createElement(App))

    await act(async () => {
      capturedOptions?.callback?.("kv-token")
    })

    await waitFor(() => {
      expect(screen.getByText("KV配信案件テスト")).toBeInTheDocument()
    })
    expect(screen.getByText("KV テストユーザー")).toBeInTheDocument()
    expect(window.sessionStorage.getItem(PORTFOLIO_DATA_STORAGE_KEY)).toContain("KV配信案件テスト")
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

  it("restores cached KV portfolioData from sessionStorage on reload without calling fetch", () => {
    const cachedData: PortfolioData = {
      ...samplePortfolioData,
      name: { ja: "キャッシュ済みユーザー", en: "Cached User" },
      brandName: "Cached.User",
      projects: [
        {
          ...samplePortfolioData.projects[0]!,
          title: { ja: "キャッシュ復元案件", en: "Cached Restored Project" },
        },
      ],
    }

    window.sessionStorage.setItem(TURNSTILE_VERIFY_STORAGE_KEY, "true")
    window.sessionStorage.setItem(PORTFOLIO_DATA_STORAGE_KEY, JSON.stringify(cachedData))

    const fetchSpy = vi.spyOn(globalThis, "fetch")

    render(createElement(App))

    expect(screen.getByText("キャッシュ復元案件")).toBeInTheDocument()
    expect(screen.getByText("キャッシュ済みユーザー")).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("toggles skill selection strictly without scrolling on deselection and switches between prefix-overlapping skills", () => {
    render(createElement(App))

    const skillsSection = document.getElementById("skills")
    const projectsSection = document.getElementById("projects")
    expect(skillsSection).not.toBeNull()
    expect(projectsSection).not.toBeNull()

    const scrollIntoViewMock = vi.fn()
    projectsSection!.scrollIntoView = scrollIntoViewMock

    const techSelect = screen.getByRole("combobox", {
      name: "技術フィルタ",
    }) as HTMLSelectElement

    const tsSkillBtn = within(skillsSection!).getByRole("button", {
      name: /TypeScript/i,
    })

    // Select skill -> sets filter and scrolls to #projects
    fireEvent.click(tsSkillBtn)
    expect(techSelect.value).toBe("TypeScript")
    expect(tsSkillBtn.className).toContain("skillSelected")
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)

    // Click same skill again -> clears filter without scrolling
    fireEvent.click(tsSkillBtn)
    expect(techSelect.value).toBe("all")
    expect(tsSkillBtn.className).not.toContain("skillSelected")
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)

    // Select "Amazon Linux" -> does NOT partially highlight "Linux", and clicking "Linux" switches filter to "Linux"
    fireEvent.change(techSelect, { target: { value: "Amazon Linux" } })
    const linuxSkillBtn = within(skillsSection!).getByRole("button", {
      name: /^Linux\b/i,
    })
    expect(linuxSkillBtn.className).not.toContain("skillSelected")

    fireEvent.click(linuxSkillBtn)
    expect(techSelect.value).toBe("Linux")
    expect(linuxSkillBtn.className).toContain("skillSelected")
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2)

    // Strict selection with prefix-overlapping skills ("Windows" vs "Windows Server")
    const overlappingSkills: SkillItem[] = [
      {
        id: "windows",
        name: "Windows",
        category: "os",
        rank: "★",
        yearsLabel: { ja: "5年以上", en: "5+ yrs" },
      },
      {
        id: "winserver",
        name: "Windows Server",
        category: "infra",
        rank: "●",
        yearsLabel: { ja: "1年以上", en: "1+ yr" },
      },
    ]
    const onSelectTech = vi.fn()
    const { container, rerender } = render(
      createElement(SkillsSection, {
        skills: overlappingSkills,
        locale: "ja",
        selectedTech: "Windows",
        onSelectTech,
      }),
    )

    const isolatedSkills = within(container)
    const winBtn = isolatedSkills.getByRole("button", { name: /^Windows\b ★/i })
    const winServerBtn = isolatedSkills.getByRole("button", {
      name: /^Windows Server\b/i,
    })

    expect(winBtn.className).toContain("skillSelected")
    expect(winServerBtn.className).not.toContain("skillSelected")

    fireEvent.click(winServerBtn)
    expect(onSelectTech).toHaveBeenCalledWith("Windows Server")

    fireEvent.click(winBtn)
    expect(onSelectTech).toHaveBeenCalledWith("all")

    rerender(
      createElement(SkillsSection, {
        skills: overlappingSkills,
        locale: "ja",
        selectedTech: "Windows Server",
        onSelectTech,
      }),
    )
    expect(winBtn.className).not.toContain("skillSelected")
    expect(winServerBtn.className).toContain("skillSelected")
  })

  it("does not show copied state in QrCodeModal when both clipboard API and execCommand fail", async () => {
    const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard")
    const originalExecCommandDescriptor = Object.getOwnPropertyDescriptor(document, "execCommand")

    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Clipboard denied")),
      },
      configurable: true,
    })
    Object.defineProperty(document, "execCommand", {
      value: vi.fn().mockReturnValue(false),
      configurable: true,
    })

    try {
      render(createElement(App))
      const qrBtn = screen.getByRole("button", { name: "Open QR Code Modal" })
      fireEvent.click(qrBtn)

      const copyBtn = screen.getByRole("button", { name: "URLをコピー" })
      await act(async () => {
        fireEvent.click(copyBtn)
      })

      expect(screen.queryByText("コピー済み")).not.toBeInTheDocument()
      expect(screen.getByRole("button", { name: "URLをコピー" })).toBeInTheDocument()
    } finally {
      if (originalClipboardDescriptor) {
        Object.defineProperty(navigator, "clipboard", originalClipboardDescriptor)
      } else {
        Reflect.deleteProperty(navigator, "clipboard")
      }
      if (originalExecCommandDescriptor) {
        Object.defineProperty(document, "execCommand", originalExecCommandDescriptor)
      } else {
        Reflect.deleteProperty(document, "execCommand")
      }
    }
  })
})
