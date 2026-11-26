---
trigger: always_on
description: Core architecture, tooling, and coding conventions for the my-portfolio repository (プロジェクト共通規約・技術スタック・ディレクトリ構成ルール).
---

# プロジェクト共通規約 (`my-portfolio`)

## 1. ツールチェーン・パッケージ管理
- **パッケージマネージャー**: 常に `pnpm`（`pnpm install`, `pnpm run <script>`）を使用すること。`npm` や `yarn` は使用せず、`package-lock.json` や `yarn.lock` を生成・コミットしないこと。
- **依存パッケージのビルドスクリプト管理（サプライチェーンセキュリティ）**:
  - `pnpm`（v12+）のデフォルト厳格チェックにより、未分類のライフサイクルスクリプト（`preinstall` / `install` / `postinstall`）を持つパッケージが追加された場合は `ERR_PNPM_IGNORED_BUILDS` で即座に検知・ブロックされる。
  - エラーが発生した際は思考停止で全許可（`pnpm approve-builds --all`）せず、スキル `evaluating-pnpm-build-scripts` に従って `node_modules` 内のスクリプト実体とプリビルトバイナリの有無を精査し、[pnpm-workspace.yaml](../../pnpm-workspace.yaml) の `allowBuilds` に `true`（実行必須かつ安全）または `false`（プリビルトバイナリ等で実行不要）として判断根拠のコメント付きで記録すること。
- **開発・プレビューサーバー**: [vite.config.ts](../../vite.config.ts) にて `host: "0.0.0.0"`, `port: 3000`, `strictPort: true` に統一している。
- **Linter / Formatter / 未使用コード検出**:
  - Linter: `oxlint`（`pnpm run lint` で `src`, `infra`, `tests` を検査）
  - Formatter: `oxfmt`（`pnpm run fmt` で自動整形、`pnpm run fmt:check` で検査）
  - 未使用コード検出: `knip`（`pnpm run knip` で `knip.json` に従い未使用ファイル・依存・エクスポート・型を検査）
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
- **テストファイル規約（`tests/`）**:
  - **すべてのテストファイルの拡張子は `.ts` に統一する**。`.tsx` のテストファイルは作成しないこと。
  - 単体テスト（Vitest: `pnpm test`）は `tests/unit/*.test.ts`（`portfolio.test.ts`, `app.test.ts`, `turnstile.test.ts`, `worker.test.ts`）、E2E・ビジュアルリグレッションテスト（Playwright: `pnpm run test:ui`）は `tests/vrt/*.spec.ts`（`desktop.spec.ts`, `mobile.spec.ts`, `print.spec.ts`）として命名・分離する。
  - VRT で生成されるスナップショット画像（`tests/vrt/snapshots/`）およびレポートはリポジトリサイズ抑制のため `.gitignore` でバージョン管理対象外とする。
  - `.ts` ファイル内では JSX の山括弧構文（`<App />`）が型アサーションと解釈され構文エラーになるため、React コンポーネントの描画には必ず `import { createElement } from "react"` の `createElement(Component, props)` を使用すること。
