import { createElement } from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import App from "../../src/App"
import { PORTFOLIO_DATA_STORAGE_KEY, TURNSTILE_VERIFY_STORAGE_KEY } from "../../src/data/constants"
import { portfolioData, samplePortfolioData } from "../../src/data/portfolioData"
import type { PortfolioData } from "../../src/types/portfolio"
import type { TurnstileRenderOptions } from "../../src/vite-env"

describe("TurnstileGate & Worker KV session caching", () => {
  afterEach(() => {
    delete window.turnstile
    vi.restoreAllMocks()
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
})
