import { afterEach, describe, expect, it, vi } from "vitest"
import workerHandler, {
  PORTFOLIO_KV_CACHE_TTL,
  PORTFOLIO_KV_KEY,
  verifyBasicAuth,
  verifyTurnstileToken,
  type Env,
  type PortfolioKVNamespace,
} from "../../infra/worker"

describe("Cloudflare Worker Basic Authentication", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("verifyBasicAuth returns true only for valid credentials", async () => {
    const validHeader = `Basic ${btoa("admin:secret123")}`
    expect(await verifyBasicAuth(validHeader, "admin", "secret123")).toBe(true)
    expect(await verifyBasicAuth(validHeader, "admin", "wrong")).toBe(false)
    expect(await verifyBasicAuth(validHeader, "wrong", "secret123")).toBe(false)
    expect(await verifyBasicAuth(null, "admin", "secret123")).toBe(false)
    expect(await verifyBasicAuth("Bearer token", "admin", "secret123")).toBe(false)

    const utf8Bytes = new TextEncoder().encode("管理者:秘密のパス123")
    const utf8Binary = Array.from(utf8Bytes, (b) => String.fromCharCode(b)).join("")
    const utf8Header = `Basic ${btoa(utf8Binary)}`
    expect(await verifyBasicAuth(utf8Header, "管理者", "秘密のパス123")).toBe(true)
    expect(await verifyBasicAuth(utf8Header, "管理者", "wrong")).toBe(false)

    const invalidUtf8Header = `Basic ${btoa("\xff\xfe:pass")}`
    expect(await verifyBasicAuth(invalidUtf8Header, "\xff\xfe", "pass")).toBe(false)
  })

  it("returns 401 with WWW-Authenticate header when Authorization header is missing or invalid", async () => {
    const env: Env = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(new Response("OK", { status: 200 })),
      },
      BASIC_AUTH_USER: "admin",
      BASIC_AUTH_PASS: "secret123",
    }

    const req = new Request("https://portfolio.example.com/")
    const res = await workerHandler.fetch(req, env)

    expect(res.status).toBe(401)
    expect(res.headers.get("WWW-Authenticate")).toContain("Basic realm=")
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex, nofollow, noarchive")
    expect(env.ASSETS.fetch).not.toHaveBeenCalled()
  })

  it("returns 200 and serves static assets with security headers when valid Basic Auth credentials are provided", async () => {
    const env: Env = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(new Response("Portfolio HTML", { status: 200 })),
      },
      BASIC_AUTH_USER: "admin",
      BASIC_AUTH_PASS: "secret123",
    }

    const req = new Request("https://portfolio.example.com/", {
      headers: {
        Authorization: `Basic ${btoa("admin:secret123")}`,
      },
    })
    const res = await workerHandler.fetch(req, env)

    expect(res.status).toBe(200)
    expect(await res.text()).toBe("Portfolio HTML")
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff")
    expect(res.headers.get("X-Frame-Options")).toBe("DENY")
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer")
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex, nofollow, noarchive")
    expect(res.headers.get("Cache-Control")).toBe("private, no-cache")
    const csp = res.headers.get("Content-Security-Policy")
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("https://challenges.cloudflare.com")
    expect(env.ASSETS.fetch).toHaveBeenCalledTimes(1)
  })

  it("fails closed with 500 when BASIC_AUTH_USER or BASIC_AUTH_PASS is not configured", async () => {
    const env: Env = {
      ASSETS: {
        fetch: vi.fn(),
      },
    }

    const req = new Request("https://portfolio.example.com/")
    const res = await workerHandler.fetch(req, env)

    expect(res.status).toBe(500)
    expect(env.ASSETS.fetch).not.toHaveBeenCalled()
  })
})

describe("Cloudflare Turnstile Siteverify API (/api/turnstile/verify)", () => {
  const validAuthHeader = `Basic ${btoa("admin:secret123")}`
  const baseEnv: Env = {
    ASSETS: {
      fetch: vi.fn(),
    },
    BASIC_AUTH_USER: "admin",
    BASIC_AUTH_PASS: "secret123",
    TURNSTILE_SECRET_KEY: "test-secret-key",
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns 200 { verified: true } when Turnstile siteverify succeeds", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const req = new Request("https://portfolio.example.com/api/turnstile/verify", {
      method: "POST",
      headers: {
        Authorization: validAuthHeader,
        "Content-Type": "application/json",
        "CF-Connecting-IP": "203.0.113.10",
      },
      body: JSON.stringify({ token: "valid-turnstile-token" }),
    })

    const res = await workerHandler.fetch(req, baseEnv)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ verified: true })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(baseEnv.ASSETS.fetch).not.toHaveBeenCalled()
  })

  it("returns 403 { verified: false } when Turnstile siteverify rejects the token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    )

    const req = new Request("https://portfolio.example.com/api/turnstile/verify", {
      method: "POST",
      headers: {
        Authorization: validAuthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "invalid-token" }),
    })

    const res = await workerHandler.fetch(req, baseEnv)
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({
      verified: false,
      error: "Turnstile verification failed.",
      codes: ["invalid-input-response"],
    })
  })

  it("returns 400 when token is missing or JSON is malformed", async () => {
    const emptyTokenReq = new Request("https://portfolio.example.com/api/turnstile/verify", {
      method: "POST",
      headers: {
        Authorization: validAuthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "   " }),
    })
    const emptyRes = await workerHandler.fetch(emptyTokenReq, baseEnv)
    expect(emptyRes.status).toBe(400)

    const badJsonReq = new Request("https://portfolio.example.com/api/turnstile/verify", {
      method: "POST",
      headers: {
        Authorization: validAuthHeader,
        "Content-Type": "application/json",
      },
      body: "{bad-json",
    })
    const badJsonRes = await workerHandler.fetch(badJsonReq, baseEnv)
    expect(badJsonRes.status).toBe(400)
  })

  it("returns 405 Method Not Allowed for non-POST requests", async () => {
    const getReq = new Request("https://portfolio.example.com/api/turnstile/verify", {
      method: "GET",
      headers: {
        Authorization: validAuthHeader,
      },
    })
    const res = await workerHandler.fetch(getReq, baseEnv)
    expect(res.status).toBe(405)
    expect(res.headers.get("Allow")).toBe("POST")
  })

  it("verifyTurnstileToken handles network failure gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"))
    const result = await verifyTurnstileToken("token", "secret")
    expect(result).toEqual({
      success: false,
      errorCodes: ["internal-error"],
    })
  })

  it("includes portfolioData from PORTFOLIO_KV when Turnstile verification succeeds", async () => {
    const mockPortfolio = { name: { ja: "テスト", en: "Test" } }
    const kvGetMock = vi.fn().mockResolvedValue(mockPortfolio)
    const kvNamespace: PortfolioKVNamespace = {
      get: kvGetMock,
    }
    const envWithKv: Env = {
      ...baseEnv,
      PORTFOLIO_KV: kvNamespace,
    }

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    const req = new Request("https://portfolio.example.com/api/turnstile/verify", {
      method: "POST",
      headers: {
        Authorization: validAuthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "valid-token" }),
    })

    const res = await workerHandler.fetch(req, envWithKv)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      verified: true,
      portfolioData: mockPortfolio,
    })
    expect(kvGetMock).toHaveBeenCalledWith(PORTFOLIO_KV_KEY, {
      type: "json",
      cacheTtl: PORTFOLIO_KV_CACHE_TTL,
    })
  })

  it("fails closed with 500 when TURNSTILE_SECRET_KEY is not configured on a production hostname", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    const envWithoutTurnstileSecret: Env = {
      ASSETS: {
        fetch: vi.fn(),
      },
      BASIC_AUTH_USER: "admin",
      BASIC_AUTH_PASS: "secret123",
    }

    const req = new Request("https://portfolio.example.com/api/turnstile/verify", {
      method: "POST",
      headers: {
        Authorization: validAuthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "valid-token" }),
    })

    const res = await workerHandler.fetch(req, envWithoutTurnstileSecret)
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      verified: false,
      error: "Turnstile verification is not configured.",
    })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("falls back to dummy secret key when TURNSTILE_SECRET_KEY is not configured on localhost", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
    const envWithoutTurnstileSecret: Env = {
      ASSETS: {
        fetch: vi.fn(),
      },
      BASIC_AUTH_USER: "admin",
      BASIC_AUTH_PASS: "secret123",
    }

    const req = new Request("http://localhost:3000/api/turnstile/verify", {
      method: "POST",
      headers: {
        Authorization: validAuthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "local-dummy-token" }),
    })

    const res = await workerHandler.fetch(req, envWithoutTurnstileSecret)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ verified: true })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it("does not read PORTFOLIO_KV or leak KV data when Basic Auth is missing or Turnstile siteverify fails", async () => {
    const kvGetMock = vi.fn().mockResolvedValue({ secret: "private-data" })
    const envWithKv: Env = {
      ...baseEnv,
      PORTFOLIO_KV: { get: kvGetMock },
    }

    const unauthReq = new Request("https://portfolio.example.com/api/turnstile/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "valid-token" }),
    })
    const unauthRes = await workerHandler.fetch(unauthReq, envWithKv)
    expect(unauthRes.status).toBe(401)
    expect(kvGetMock).not.toHaveBeenCalled()

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    )

    const failedVerifyReq = new Request("https://portfolio.example.com/api/turnstile/verify", {
      method: "POST",
      headers: {
        Authorization: validAuthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: "invalid-token" }),
    })
    const failedVerifyRes = await workerHandler.fetch(failedVerifyReq, envWithKv)
    expect(failedVerifyRes.status).toBe(403)
    const failedPayload = (await failedVerifyRes.json()) as {
      verified: boolean
      portfolioData?: unknown
    }
    expect(failedPayload.verified).toBe(false)
    expect(failedPayload.portfolioData).toBeUndefined()
    expect(kvGetMock).not.toHaveBeenCalled()
  })
})
