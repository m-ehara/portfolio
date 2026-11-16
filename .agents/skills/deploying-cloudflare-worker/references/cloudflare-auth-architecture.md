# Cloudflare Workers Static Assets & Basic 認証アーキテクチャ

## 1. リクエスト処理フロー (`run_worker_first: true`)

```text
クライアントリクエスト
  │
  ▼
Cloudflare Worker (`infra/worker.ts`)
  ├─ 環境変数 `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` が未設定か？
  │    └─> `500 Internal Server Error` を返却（誤公開防止のフェイルクローズ）
  ├─ `Authorization: Basic <base64>` ヘッダーが欠落または不一致か？
  │    └─> `401 Unauthorized` + `WWW-Authenticate: Basic realm="Portfolio Private Access"` を返却
  └─ 認証成功（SHA-256固定長ハッシュ化＋定数時間バイト比較 `timingSafeEqualString` で文字数・内容のタイミング漏洩を防止）
       ├─ `POST /api/turnstile/verify` -> `TURNSTILE_SECRET_KEY` 検証（本番ドメインで未設定時は `500` フェイルクローズ、`localhost`/`127.0.0.1`/`[::1]` のみダミーキーフォールバック）。検証成功時に `PORTFOLIO_KV`（`cacheTtl: 3600`）が設定されていれば `{ verified: true, portfolioData }` を返却
       └─ その他 -> `env.ASSETS.fetch(request)` に委譲し、セキュリティヘッダー（`CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Robots-Tag: noindex, nofollow, noarchive`, `Cache-Control: private, no-cache`）を付与して `./dist` の静的アセットを配信
```

## 2. `wrangler.jsonc` の必須設定項目

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "portfolio",
  "main": "infra/worker.ts",
  "compatibility_date": "2026-06-01",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application",
    "run_worker_first": true
  }
}
```

- `binding: "ASSETS"`: `infra/worker.ts` から `env.ASSETS.fetch(request)` を呼び出すためのバインディング名です。
- `not_found_handling: "single-page-application"`: 認証通過後、存在しないパスへのアクセス時に `index.html` を返します。
- `run_worker_first: true`: `/index.html` や `/assets/*` を含む全リクエストで必ず最初に `infra/worker.ts` を実行させます。

## 3. GitHub Actions CI/CD (`.github/workflows/deploy.yml`)
- `main` ブランチへの `push` および `pull_request` で起動します。
- `quality-and-test` ジョブ: `pnpm install --frozen-lockfile` → `pnpm run lint` → `pnpm run fmt:check` → `pnpm run test` → `VITE_IGNORE_PRIVATE_DATA=true pnpm run build` を実行し、`dist` アーティファクトを保存します。
- `deploy` ジョブ: `main` ブランチへの `push` 時のみ実行され、`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` が未設定（フォーク等）の場合は安全にスキップされます。`CLOUDFLARE_KV_NAMESPACE_ID` が設定されていればデプロイ直前に `wrangler.jsonc` へ `PORTFOLIO_KV` バインディングを一時注入し、`cloudflare/wrangler-action@v3`（`wranglerVersion: "4.156.0"`）を用いて Basic 認証・Turnstile シークレット（`BASIC_AUTH_USER`, `BASIC_AUTH_PASS`, `TURNSTILE_SECRET_KEY`）を自動同期してデプロイします。
