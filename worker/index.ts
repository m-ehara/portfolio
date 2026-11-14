export interface KvGetJsonOptions {
  type: "json"
  cacheTtl?: number
}

export interface PortfolioKVNamespace {
  get: (key: string, options?: KvGetJsonOptions) => Promise<unknown>
}

export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
  PORTFOLIO_KV?: PortfolioKVNamespace
  BASIC_AUTH_USER?: string
  BASIC_AUTH_PASS?: string
  TURNSTILE_SECRET_KEY?: string
}

export const PORTFOLIO_KV_KEY = "portfolio_data"
export const PORTFOLIO_KV_CACHE_TTL = 3600

export interface TurnstileVerifyResult {
  success: boolean
  errorCodes?: string[]
}

const TURNSTILE_SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify"

// Cloudflare official dummy secret key for local testing when TURNSTILE_SECRET_KEY is not set
const TURNSTILE_DUMMY_SECRET_KEY = "1x0000000000000000000000000000000AA"

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
}

const UNAUTHORIZED_HEADERS: Record<string, string> = {
  ...SECURITY_HEADERS,
  "WWW-Authenticate": 'Basic realm="Portfolio Private Access", charset="UTF-8"',
  "Cache-Control": "no-store",
  "Content-Type": "text/plain; charset=utf-8",
}

const JSON_HEADERS: Record<string, string> = {
  ...SECURITY_HEADERS,
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
}

const timingSafeEqualString = async (
  a: string,
  b: string,
): Promise<boolean> => {
  const encoder = new TextEncoder()
  const [aHash, bHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ])
  const aBytes = new Uint8Array(aHash)
  const bBytes = new Uint8Array(bHash)

  let diff = 0
  for (let i = 0; i < aBytes.byteLength; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0)
  }
  return diff === 0
}

export const verifyBasicAuth = async (
  authHeader: string | null,
  expectedUser: string,
  expectedPass: string,
): Promise<boolean> => {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false
  }

  const base64Credentials = authHeader.slice(6).trim()
  let decoded: string
  try {
    decoded = atob(base64Credentials)
  } catch {
    return false
  }

  const colonIndex = decoded.indexOf(":")
  if (colonIndex === -1) {
    return false
  }

  const user = decoded.slice(0, colonIndex)
  const pass = decoded.slice(colonIndex + 1)

  const [userMatch, passMatch] = await Promise.all([
    timingSafeEqualString(user, expectedUser),
    timingSafeEqualString(pass, expectedPass),
  ])

  return userMatch && passMatch
}

export const verifyTurnstileToken = async (
  token: string,
  secretKey: string,
  remoteIp?: string | null,
): Promise<TurnstileVerifyResult> => {
  try {
    const payload: Record<string, string> = {
      secret: secretKey,
      response: token,
    }
    if (remoteIp) {
      payload.remoteip = remoteIp
    }

    const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return {
        success: false,
        errorCodes: [`http-${response.status}`],
      }
    }

    const data = (await response.json()) as {
      success?: boolean
      "error-codes"?: string[]
    }

    return {
      success: Boolean(data.success),
      errorCodes: data["error-codes"],
    }
  } catch {
    return {
      success: false,
      errorCodes: ["internal-error"],
    }
  }
}

const isLocalHostname = (hostname: string): boolean =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"

const readPortfolioDataFromKv = async (env: Env): Promise<unknown> => {
  if (!env.PORTFOLIO_KV) {
    return null
  }

  try {
    const value = await env.PORTFOLIO_KV.get(PORTFOLIO_KV_KEY, {
      type: "json",
      cacheTtl: PORTFOLIO_KV_CACHE_TTL,
    })
    return value ?? null
  } catch {
    return null
  }
}

const handleTurnstileVerify = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ verified: false, error: "Method Not Allowed" }),
      {
        status: 405,
        headers: {
          ...JSON_HEADERS,
          Allow: "POST",
        },
      },
    )
  }

  let body: { token?: unknown }
  try {
    body = ((await request.json()) as { token?: unknown })
  } catch {
    return new Response(
      JSON.stringify({ verified: false, error: "Invalid JSON payload." }),
      {
        status: 400,
        headers: JSON_HEADERS,
      },
    )
  }

  const token = typeof body.token === "string" ? body.token.trim() : ""
  if (!token) {
    return new Response(
      JSON.stringify({ verified: false, error: "Missing Turnstile token." }),
      {
        status: 400,
        headers: JSON_HEADERS,
      },
    )
  }

  const hostname = new URL(request.url).hostname
  const secretKey =
    env.TURNSTILE_SECRET_KEY ||
    (isLocalHostname(hostname) ? TURNSTILE_DUMMY_SECRET_KEY : "")
  if (!secretKey) {
    return new Response(
      JSON.stringify({
        verified: false,
        error: "Turnstile verification is not configured.",
      }),
      {
        status: 500,
        headers: JSON_HEADERS,
      },
    )
  }

  const remoteIp = request.headers.get("CF-Connecting-IP")
  const result = await verifyTurnstileToken(token, secretKey, remoteIp)

  if (!result.success) {
    return new Response(
      JSON.stringify({
        verified: false,
        error: "Turnstile verification failed.",
        codes: result.errorCodes ?? [],
      }),
      {
        status: 403,
        headers: JSON_HEADERS,
      },
    )
  }

  const portfolioData = await readPortfolioDataFromKv(env)
  const payload =
    portfolioData !== null
      ? { verified: true, portfolioData }
      : { verified: true }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: JSON_HEADERS,
  })
}

const handleGetPortfolio = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: {
        ...JSON_HEADERS,
        Allow: "GET",
      },
    })
  }

  const portfolioData = await readPortfolioDataFromKv(env)
  if (portfolioData === null) {
    return new Response(
      JSON.stringify({ error: "Portfolio data not found in KV." }),
      {
        status: 404,
        headers: JSON_HEADERS,
      },
    )
  }

  return new Response(JSON.stringify({ portfolioData }), {
    status: 200,
    headers: JSON_HEADERS,
  })
}

export default {
  fetch: async (request: Request, env: Env): Promise<Response> => {
    const expectedUser = env.BASIC_AUTH_USER
    const expectedPass = env.BASIC_AUTH_PASS

    if (!expectedUser || !expectedPass) {
      return new Response("Authentication is not configured.", {
        status: 500,
        headers: {
          ...SECURITY_HEADERS,
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    }

    const authHeader = request.headers.get("Authorization")
    const isAuthorized = await verifyBasicAuth(
      authHeader,
      expectedUser,
      expectedPass,
    )

    if (!isAuthorized) {
      return new Response("401 Unauthorized", {
        status: 401,
        headers: UNAUTHORIZED_HEADERS,
      })
    }

    const url = new URL(request.url)
    if (url.pathname === "/api/turnstile/verify") {
      return handleTurnstileVerify(request, env)
    }
    if (url.pathname === "/api/portfolio") {
      return handleGetPortfolio(request, env)
    }

    const assetResponse = await env.ASSETS.fetch(request)
    const headers = new Headers(assetResponse.headers)
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(key, value)
    }
    headers.set("Cache-Control", "private, no-cache")

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    })
  },
}
