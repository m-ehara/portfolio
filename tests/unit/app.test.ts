import { createElement } from "react"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import App from "../../src/App"
import { SkillsSection } from "../../src/components/SkillsSection"
import { portfolioData } from "../../src/data/portfolioData"
import { calculateElapsedYears } from "../../src/utils/date"
import type { SkillItem } from "../../src/types/portfolio"

describe("App UI interactions & edge cases", () => {
  afterEach(() => {
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

  it("opens and closes the QR code share modal via close button or Escape key", () => {
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
