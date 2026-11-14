---
name: verifying-quality-and-tests
description: >-
  単体テスト（Vitest）、静的解析（Oxlint）、コードフォーマット（Oxfmt）、および TypeScript 型チェック・
  ビルド検証を実行・保守するスキル。Use this skill when writing or fixing unit tests,
  resolving lint or formatting errors, or validating the codebase before committing
  or deploying (テスト追加・修正, Vitest実行, Oxlint/Oxfmtチェック, 型エラー修正, 品質検証).
compatibility: Requires Node.js >= 20 and pnpm.
---

# コード品質検証・テスト実行手順

このスキルは、`my-portfolio` における一括品質チェック手順と、テストコード作成時の固有ルールを定義します。

## 実行ステップ

1. **一括検証スクリプトの実行**:
   - コード変更後の検証は、個別コマンドを手動で組み立てる代わりに [scripts/verify-all.sh](./scripts/verify-all.sh) を実行してください（Oxlint → Oxfmt → `tsc -b` → Vitest → Vite Build を順次検証します）：
     ```bash
     bash .agents/skills/verifying-quality-and-tests/scripts/verify-all.sh
     ```
   - `oxfmt --check` で差分が検出された場合は、`pnpm run fmt`（`oxfmt -w src worker scripts`）を実行して自動整形してください。

2. **テストファイル作成・編集時の `.ts` 拡張子ルール**:
   - `src/test/` 配下のテストを変更・追加する際は、事前に [references/testing-conventions.md](./references/testing-conventions.md) を確認してください。
   - **重要規約**: すべてのテストファイルは `.ts` 拡張子に統一されています（`.tsx` 禁止）。React コンポーネントを描画する際は JSX 構文ではなく `React.createElement` を使用してください。

3. **テスト対象の網羅**:
   - フロントエンドUIおよびフィルタロジックの単体テスト（Vitest）は `src/test/portfolio.test.ts` に記述します。
   - Cloudflare Worker（Basic 認証、Turnstile 検証 `/api/turnstile/verify`、および `PORTFOLIO_KV` 配信 `/api/portfolio`）の単体テスト（Vitest）は `src/test/worker.test.ts` に記述します。
   - ヘッドレス実ブラウザによるビジュアルリグレッションテスト（Playwright VRT: `pnpm run test:ui` / `pnpm run test:ui:update`）は `src/test/vrt.spec.ts` に記述します（出力されるスナップショット画像 `src/test/*-snapshots/` は `.gitignore` でバージョン管理対象外）。
