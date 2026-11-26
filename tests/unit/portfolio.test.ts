import { describe, expect, it } from "vitest"
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
import type { ProjectItem } from "../../src/types/portfolio"

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
