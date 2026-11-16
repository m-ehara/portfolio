---
name: deploying-cloudflare-worker
description: >-
  Cloudflare Workers（Static Assets）および Basic 認証レイヤー（infra/worker.ts, wrangler.jsonc,
  .github/workflows/deploy.yml）の設定・ローカル検証・シークレット管理・デプロイを行うスキル。
  Use this skill when modifying authentication logic, updating Cloudflare Workers
  Static Assets settings, managing secrets (BASIC_AUTH_USER / BASIC_AUTH_PASS),
  or troubleshooting CI/CD deployments (Cloudflareデプロイ, Basic認証設定, Wrangler設定,
  GitHub Actions CI/CD, シークレット管理).
compatibility: Requires Node.js >= 20, pnpm, and wrangler.
---

# Cloudflare Workers デプロイ & Basic 認証管理手順

このスキルは、Cloudflare Workers の Static Assets 配信と Basic 認証によるプライベートアクセス制御の運用・変更手順を定義します。

## 実行ステップ

1. **Worker & Static Assets 構成の確認**:
   - `wrangler.jsonc` や `infra/worker.ts` を変更する前に、必ず [references/cloudflare-auth-architecture.md](./references/cloudflare-auth-architecture.md) を読み、認証フローの仕様を確認してください。
   - **最重要ルール**: `wrangler.jsonc` の `assets.run_worker_first: true` は絶対に削除・`false` 化しないでください。これが `true` でない場合、静的ファイル（`./dist`）が Worker を経由せずに直接公開配信され、Basic 認証がバイパスされます。

2. **ローカルでの Wrangler 認証動作テスト**:
   - `.dev.vars.example` を `.dev.vars` にコピーし（`.dev.vars` は `.gitignore` 対象）、テスト用の `BASIC_AUTH_USER`、`BASIC_AUTH_PASS`、および `TURNSTILE_SECRET_KEY` を設定します。
   - ビルドを実行した上で、ポート `3000` でローカル Worker を起動して検証します：
     ```bash
     pnpm run build
     pnpm exec wrangler dev --ip 0.0.0.0 --port 3000
     ```

3. **本番環境の認証情報・シークレット（Secret）の登録・更新**:
   - 認証情報や検証キーはコードや `wrangler.jsonc` にハードコードせず、GitHub リポジトリの Actions Secrets（`BASIC_AUTH_USER` / `BASIC_AUTH_PASS` / `TURNSTILE_SECRET_KEY` およびビルド時の `VITE_TURNSTILE_SITE_KEY`）で一元管理します（`.github/workflows/deploy.yml` の `cloudflare/wrangler-action@v3` がデプロイ時に Worker シークレットを自動で Cloudflare Workers 側へ同期します）。
   - ローカルから手動で直接更新したい場合のみ、以下の CLI コマンドを使用します：
     ```bash
     pnpm exec wrangler secret put BASIC_AUTH_USER
     pnpm exec wrangler secret put BASIC_AUTH_PASS
     pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
     ```

4. **Cloudflare Workers KV (`PORTFOLIO_KV`) への実データ同期**:
   - `wrangler.jsonc` にはアカウント固有の KV Namespace ID を記載せず、`.dev.vars`（ローカル `pnpm run kv:put:remote` 用）および GitHub Actions Secrets（`CLOUDFLARE_KV_NAMESPACE_ID`：CI デプロイ時に一時注入）で管理します。
   - 本番静的アセット（`dist/`）には `src/data/sample/` のみを含め（`pnpm run deploy` および CI ビルドは `VITE_IGNORE_PRIVATE_DATA=true` でビルド）、実データは `PORTFOLIO_KV` から配信します。
   - `src/data/private/` を KV へアップロードするには以下を実行します：
     ```bash
     pnpm run kv:put:local   # ローカル wrangler dev 検証用
     pnpm run kv:put:remote  # .dev.vars または環境変数の CLOUDFLARE_KV_NAMESPACE_ID を参照して本番 KV へ反映
     ```

5. **テスト検証とデプロイ**:
   - `pnpm run test` を実行し、`src/test/worker.test.ts` の全ケース（未認証時 `401`、正常認証時 `200`、環境変数未設定時のフェイルクローズ `500`、KV配信API `/api/portfolio` 含む）がパスすることを確認します。
   - 手動デプロイは `pnpm run deploy`（自動で `VITE_IGNORE_PRIVATE_DATA=true` ビルドを実行）、自動デプロイは `main` ブランチへの push（`.github/workflows/deploy.yml`）で行います。
