# テスト実装・品質管理規約 リファレンス

## 1. テストファイルを `.ts` に統一する理由と実装パターン
本リポジトリでは、`tests/` 配下のすべてのファイルを `.ts` 拡張子に統一しています：
- `tests/unit/setup.ts`: `@testing-library/jest-dom/vitest` を読み込み、DOM マッチャー（`.toBeInTheDocument()` 等）を有効化します。
- `tests/unit/portfolio.test.ts`: データ整合性、`filterSkills` / `filterProjects`、および `App` コンポーネントのUI操作テスト（Vitest: `*.test.ts`）。`src/data/private/` の有無にかかわらず（`src/data/sample/` フォールバック環境でも）全テストがパスするよう、`portfolioData` の動的参照を用いて検証します。
- `tests/unit/worker.test.ts`: Cloudflare Worker の Basic 認証（`verifyBasicAuth`）、Turnstile 検証（`verifyTurnstileToken` / `POST /api/turnstile/verify`）、および検証成功時の `PORTFOLIO_KV` 配信の単体テスト（Vitest: `*.test.ts`）。
- `tests/vrt/*.spec.ts`: Playwright によるビジュアルリグレッションテスト（`desktop.spec.ts`, `mobile.spec.ts`, `print.spec.ts` および `tests/vrt/helper.ts`）。生成されるスナップショット画像（`tests/vrt/snapshots/`）は `.gitignore` によりバージョン管理対象外としています。

TypeScript では `.ts` ファイル内の `<App />` 記法が型アサーションと解釈され構文エラーになるため、コンポーネント描画には必ず `"react"` の `createElement` を使用してください。また、個人情報や特定案件文字列をハードコードせず、`portfolioData`（`private/` または `sample/`）を参照してください：

```ts
import { createElement } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import App from "../../src/App"
import { portfolioData } from "../../src/data/portfolioData"

describe("UI test in .ts file", () => {
  it("renders App without JSX syntax", () => {
    render(createElement(App))
    expect(screen.getByText(portfolioData.projects[0]!.title.ja)).toBeInTheDocument()
  })
})
```

## 2. 複数箇所に表示されるテキストの検証注意点
職種名（`portfolioData.jobTitle.en` など）のように、ヒーローセクションとフッターの両方に表示される文言を Testing Library で検証する際は、`screen.getByText(...)` を使うと複数要素ヒットによるエラーになります。
以下のように `screen.getAllByText(...)` を使用してください：

```ts
expect(
  screen.getAllByText(portfolioData.jobTitle.en).length,
).toBeGreaterThanOrEqual(1)
```

## 3. Oxlint / Oxfmt の設定仕様
- **Oxlint** (`.oxlintrc.json`): `react`, `typescript`, `unicorn` プラグインを有効化し、React 19 の JSX Transform に合わせて `react/react-in-jsx-scope: "off"` を設定しています。
- **Oxfmt** (`.oxfmtrc.json`): `src/`, `infra/`, `tests/` を対象に、2スペースインデント・ダブルクォート・セミコロンなしで整形します。ファイル編集後は必ず `pnpm run fmt` を実行してください。
  - **パーサー上の注意点**: `oxfmt@0.1.0` はアロー関数の型述語戻り値（`: value is Type`）やインラインオブジェクト型内の `;` を誤整形する場合があるため、型ガード判定には `: boolean` 戻り値を用い、オブジェクト型は `interface` 宣言として切り出してください。
