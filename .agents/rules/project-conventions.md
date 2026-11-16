---
trigger: always_on
description: Core architecture, tooling, and coding conventions for the my-portfolio repository (プロジェクト共通規約・技術スタック・ディレクトリ構成ルール).
---

# プロジェクト共通規約 (`my-portfolio`)

## 1. ツールチェーン・パッケージ管理
- **パッケージマネージャー**: 常に `pnpm`（`pnpm install`, `pnpm run <script>`）を使用すること。`npm` や `yarn` は使用せず、`package-lock.json` や `yarn.lock` を生成・コミットしないこと。
- **開発・プレビューサーバー**: [vite.config.ts](../../vite.config.ts) にて `host: "0.0.0.0"`, `port: 3000`, `strictPort: true` に統一している。
- **Linter & Formatter**:
  - Linter: `oxlint`（`pnpm run lint` で `src` と `infra` を検査）
  - Formatter: `oxfmt`（`pnpm run fmt` で自動整形、`pnpm run fmt:check` で検査）
  - コードスタイル: 2スペースインデント、ダブルクォート（`"`）、末尾セミコロンなし（`oxfmt` 準拠）。
  - 関数定義スタイル: コンポーネント・ユーティリティ関数・ハンドラーを含め、すべての関数は `function` 宣言ではなくラムダ式（アロー関数：`const fn = (...) => { ... }`）で統一して定義すること。

## 2. ディレクトリ・モジュール分割規約
- **データ・ロジック層（`src/data/` & `src/utils/`）**:
  - `src/data/portfolioData.ts` は `src/data/private/`（存在時）を優先し、存在しない場合は `src/data/sample/` にフォールバックする集約・解決エントリポイントとして保つこと。
  - 定数は `src/data/constants.ts`、UI文言辞書は `src/data/i18n.ts`、フィルタ関数は `src/utils/filters.ts` に配置し、基本プロフィール・経歴・得意分野（`profile.ts`）・スキル一覧（`skills.ts`）・案件実績（`projects.ts`）は公開用サンプルを `src/data/sample/`、非公開の実データを `.gitignore` 対象の `src/data/private/` に配置する。
  - すべての表示テキストは `LocalizedText` 型（`{ ja: string, en: string }`）に従い、日本語と英語の両方を必ず定義する。
- **スタイル層（`src/styles/` & `src/styles/modules/`）**:
  - `src/styles/index.css` は `@import`（`variables.css`, `base.css`）のみを記述するエントリポイントとする。
  - グローバル共通トークン・ベース定義は `src/styles/variables.css`（`1rem = 16px` 標準のまま、タイポグラフィ `--font-size-*`、余白 `--space-*`、角丸 `--radius-*`、カラーテーマ変数を定義）、`src/styles/base.css` に配置し、各コンポーネント固有のスタイルは CSS Modules（`src/styles/modules/*.module.css`）＋ ネイティブ CSS Nesting で記述する。
- **テストファイル規約（`src/test/`）**:
  - **すべてのテストファイルの拡張子は `.ts` に統一する**。`.tsx` のテストファイルは作成しないこと。
  - 単体テスト（Vitest: `pnpm test`）は `src/test/*.test.ts`（`portfolio.test.ts`, `worker.test.ts`）、E2E・ビジュアルリグレッションテスト（Playwright: `pnpm run test:ui`）は `src/test/*.spec.ts`（`vrt.spec.ts`）として命名・分離する。
  - VRT で生成されるスナップショット画像（`src/test/*-snapshots/`）およびレポートはリポジトリサイズ抑制のため `.gitignore` でバージョン管理対象外とする。
  - `.ts` ファイル内では JSX の山括弧構文（`<App />`）が型アサーションと解釈され構文エラーになるため、React コンポーネントの描画には必ず `import { createElement } from "react"` の `createElement(Component, props)` を使用すること。
