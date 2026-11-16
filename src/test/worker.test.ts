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
    expect(await verifyBasicAuth("Bearer token", "admin", "secret123")).toBe(
      false,
    )
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
        fetch: vi
          .fn()
          .mockResolvedValue(new Response("Portfolio HTML", { status: 200 })),
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

    const req = new Request(
      "https://portfolio.example.com/api/turnstile/verify",
      {
        method: "POST",
        headers: {
          Authorization: validAuthHeader,
          "Content-Type": "application/json",
          "CF-Connecting-IP": "203.0.113.10",
        },
        body: JSON.stringify({ token: "valid-turnstile-token" }),
      },
    )

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

    const req = new Request(
      "https://portfolio.example.com/api/turnstile/verify",
      {
        method: "POST",
        headers: {
          Authorization: validAuthHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: "invalid-token" }),
      },
    )

    const res = await workerHandler.fetch(req, baseEnv)
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({
      verified: false,
      error: "Turnstile verification failed.",
      codes: ["invalid-input-response"],
    })
  })

  it("returns 400 when token is missing or JSON is malformed", async () => {
    const emptyTokenReq = new Request(
      "https://portfolio.example.com/api/turnstile/verify",
      {
        method: "POST",
        headers: {
          Authorization: validAuthHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: "   " }),
      },
    )
    const emptyRes = await workerHandler.fetch(emptyTokenReq, baseEnv)
    expect(emptyRes.status).toBe(400)

    const badJsonReq = new Request(
      "https://portfolio.example.com/api/turnstile/verify",
      {
        method: "POST",
        headers: {
          Authorization: validAuthHeader,
          "Content-Type": "application/json",
        },
        body: "{bad-json",
      },
    )
    const badJsonRes = await workerHandler.fetch(badJsonReq, baseEnv)
    expect(badJsonRes.status).toBe(400)
  })

  it("returns 405 Method Not Allowed for non-POST requests", async () => {
    const getReq = new Request(
      "https://portfolio.example.com/api/turnstile/verify",
      {
        method: "GET",
        headers: {
          Authorization: validAuthHeader,
        },
      },
    )
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

    const req = new Request(
      "https://portfolio.example.com/api/turnstile/verify",
      {
        method: "POST",
        headers: {
          Authorization: validAuthHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: "valid-token" }),
      },
    )

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

    const req = new Request(
      "https://portfolio.example.com/api/turnstile/verify",
      {
        method: "POST",
        headers: {
          Authorization: validAuthHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: "valid-token" }),
      },
    )

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
})

describe("Portfolio KV API (/api/portfolio)", () => {
  const validAuthHeader = `Basic ${btoa("admin:secret123")}`
  const baseEnv: Env = {
    ASSETS: {
      fetch: vi.fn(),
    },
    BASIC_AUTH_USER: "admin",
    BASIC_AUTH_PASS: "secret123",
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns 200 with portfolioData when PORTFOLIO_KV contains data", async () => {
    const mockPortfolio = { handle: "sample-dev" }
    const kvGetMock = vi.fn().mockResolvedValue(mockPortfolio)
    const envWithKv: Env = {
      ...baseEnv,
      PORTFOLIO_KV: { get: kvGetMock },
    }

    const req = new Request("https://portfolio.example.com/api/portfolio", {
      method: "GET",
      headers: { Authorization: validAuthHeader },
    })

    const res = await workerHandler.fetch(req, envWithKv)
    expect(res.status).toBe(200)
    expect(res.headers.get("Cache-Control")).toBe("no-store")
    expect(await res.json()).toEqual({ portfolioData: mockPortfolio })
    expect(kvGetMock).toHaveBeenCalledWith(PORTFOLIO_KV_KEY, {
      type: "json",
      cacheTtl: PORTFOLIO_KV_CACHE_TTL,
    })
  })

  it("returns 404 when PORTFOLIO_KV is unbound or has no data", async () => {
    const req = new Request("https://portfolio.example.com/api/portfolio", {
      method: "GET",
      headers: { Authorization: validAuthHeader },
    })

    const unboundRes = await workerHandler.fetch(req, baseEnv)
    expect(unboundRes.status).toBe(404)

    const emptyKvRes = await workerHandler.fetch(req, {
      ...baseEnv,
      PORTFOLIO_KV: { get: vi.fn().mockResolvedValue(null) },
    })
    expect(emptyKvRes.status).toBe(404)
  })

  it("returns 405 Method Not Allowed for non-GET requests", async () => {
    const req = new Request("https://portfolio.example.com/api/portfolio", {
      method: "POST",
      headers: { Authorization: validAuthHeader },
    })

    const res = await workerHandler.fetch(req, baseEnv)
    expect(res.status).toBe(405)
    expect(res.headers.get("Allow")).toBe("GET")
  })

  it("blocks unauthenticated requests with 401 before checking KV", async () => {
    const kvGetMock = vi.fn()
    const req = new Request("https://portfolio.example.com/api/portfolio", {
      method: "GET",
    })

    const res = await workerHandler.fetch(req, {
      ...baseEnv,
      PORTFOLIO_KV: { get: kvGetMock },
    })
    expect(res.status).toBe(401)
    expect(kvGetMock).not.toHaveBeenCalled()
  })
})
