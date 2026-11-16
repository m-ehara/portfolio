# Portfolio & Skill Sheet

Web アプリケーションエンジニア / プロジェクトマネージャー向けのポートフォリオおよび職務経歴書（スキルシート）Web アプリケーションです。

TypeScript による堅牢な設計、コンポーネント指向、CSS Modules + デザイントークン、Playwright によるビジュアルリグレッションテスト（VRT）、および Cloudflare Workers エッジでの多層防御（Basic 認証 ＋ Cloudflare Turnstile ボット検証）を備えています。

---

## 主な機能 (Key Features)

1. **スキル・案件連動インタラクティブマトリクス**:
   - 言語・FW/ライブラリ・DB・インフラ・OS・AI ツール・その他 DevOps のカテゴリ別スキル一覧
   - 経験ランク（★/◎/●/○/△）および検索フィルタリング
   - スキルバッジや技術タグをクリックすると、該当技術を使用した案件実績へ自動スクロール＆クロスフィルタリング
   - 役割（`PM` / `PMO` / `SE`）やフリーワードによる案件絞り込み
2. **職務経歴書モード（A4 印刷・PDF 保存最適化）**:
   - ワンクリックでスキルシート準拠の 2 ページ表形式レイアウトに瞬時に切り替え
   - `@media print` に完全最適化され、ブラウザ印刷・PDF 保存で面談・提案資料としてそのまま利用可能
3. **QR コード共有モーダル**:
   - スマートフォン等で即座にアクセスできる QR コード表示
   - ポートフォリオ URL のクリップボードコピー、および QR コード画像（PNG / SVG）のワンクリックダウンロード機能
4. **日付・期間の動的計算（JST 準拠・決定論的計算）**:
   - 更新年月（`updatedAt`）の当月自動更新
   - 開始年月（実務経験・フリーランス歴）からの満年数を動的算出
   - 全案件の参画期間・月数（両端入れ）および日英表記ラベルを自動生成
   - 外部ライブラリを入れず、標準 `Intl.DateTimeFormat`（`timeZone: "Asia/Tokyo"`）を用いてタイムゾーンや環境依存のズレを完全に排除
5. **ダーク / ライトテーマ切替**:
   - CSS カスタムプロパティ（デザイントークン）によるダーク・ライト両テーマの完全対応
6. **日英バイリンガル（i18n）切替**:
   - 自己PR・強み・全スキル・全案件の実績・UI文言をすべて `ja` / `en` で構造化保持

---

## セキュリティ & 多層防御 (Defense in Depth)

本アプリケーションは、不正な自動スクレイピングや非公開情報の流出を防ぐため、Cloudflare Workers エッジ上で **多層防御（2段階認証ゲート）** を敷いています。

```text
クライアントアクセス
  │
  ▼
【第1関門】Cloudflare Workers エッジ Basic 認証
  ├─ SHA-256 ハッシュ化 ＋ 定数時間バイト比較（timingSafeEqualString）によるタイミング攻撃防御
  └─ 未設定・不一致時は即座に 401 Unauthorized / 500 Fail-closed
  │
  ▼
【第2関門】Cloudflare Turnstile ボット検証ゲート
  ├─ 初回アクセス・未検証セッション時に検証ゲート画面を表示
  ├─ Cloudflare Managed チャレンジによる機械学習ボット判定（正規ブラウザは操作不要で自動通過）
  ├─ POST /api/turnstile/verify にて Worker サーバー間通信で siteverify API 検証（403 遮断）
  └─ 検証通過後は sessionStorage で同一セッション中の再認証をスキップ
  │
  ▼
ポートフォリオ本編 / 静的アセット配信（厳格な CSP / セキュリティヘッダー付与）
```

- **セキュリティヘッダー**:
  - `Content-Security-Policy`: 最小権限ディレクティブのみを許可（`https://challenges.cloudflare.com`, Google Fonts 等）
  - `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`
  - `X-Robots-Tag: noindex, nofollow, noarchive`（検索エンジンによるインデックス完全拒否）

---

## 技術スタック (Tech Stack)

| カテゴリ | 採用技術 |
| :--- | :--- |
| **言語** | TypeScript |
| **UI ライブラリ** | React（コンポーネントはアロー関数で統一） |
| **ビルドツール** | Vite |
| **スタイリング** | CSS Modules + ネイティブ CSS Nesting + グローバルデザイントークン |
| **アイコン** | Lucide React |
| **パッケージマネージャー** | pnpm |
| **Linter / Formatter** | Oxlint (`oxlint`), Oxfmt (`oxfmt`) |
| **未使用コード検出** | Knip (`knip`) |
| **単体テスト** | Vitest + Testing Library (`@testing-library/react`) |
| **E2E / VRT テスト** | Playwright (`@playwright/test`) |
| **ホスティング / エッジ** | Cloudflare Workers（Static Assets + Worker Routing） |
| **CI / CD** | GitHub Actions |

---

## ディレクトリ構成 (Directory Structure)

```text
.
├── .github/workflows/         # GitHub Actions CI/CD パイプライン
├── src/
│   ├── components/            # UI コンポーネント（Header, Footer, Hero, About, Skills, Projects, TurnstileGate 等）
│   ├── data/                  # ポートフォリオデータ層
│   │   ├── constants.ts       # 共通定数・デフォルト設定
│   │   ├── i18n.ts            # UI文言辞書 (ja/en)
│   │   ├── portfolioData.ts   # private優先 → sampleフォールバックの解決エントリ
│   │   ├── sample/            # 公開用汎用サンプルデータ（Clone直後・CI用）
│   │   └── private/           # [.gitignore] 個人用実データ（各自が手元で作成）
│   ├── styles/
│   │   ├── modules/           # 各コンポーネント固有の CSS Modules (*.module.css)
│   │   ├── variables.css      # タイポグラフィ・余白・角丸・テーマデザイントークン
│   │   └── base.css           # リセット・共通レイアウトスタイル
│   ├── types/                 # TypeScript 型定義 (portfolio.ts)
│   └── utils/                 # 純粋関数ロジック（filters.ts, date.ts）
├── infra/
│   ├── worker.ts              # Cloudflare Worker エントリポイント（Basic認証, Turnstile検証, KV配信, CSP）
│   └── sync-kv.ts             # 個人データ JSON 書き出し & Cloudflare Workers KV 同期スクリプト
├── tests/                     # テストスイート（規約上すべてのテストファイルは *.ts）
│   ├── unit/                  # 単体テスト (Vitest)
│   │   ├── setup.ts           # Vitest セットアップ
│   │   ├── portfolio.test.ts  # フロントエンドUI・フィルタ・日付計算単体テスト
│   │   └── worker.test.ts     # Cloudflare Worker 認証・Turnstile siteverify 単体テスト
│   └── vrt/                   # ビジュアルリグレッションテスト (Playwright)
│       ├── helper.ts          # VRT 安定化処理・フック
│       ├── desktop.spec.ts    # デスクトップ表示 VRT
│       ├── mobile.spec.ts     # モバイル表示・ドロワー VRT
│       ├── print.spec.ts      # 職務経歴書・印刷表示 VRT
│       └── snapshots/         # [.gitignore] VRT スナップショット画像
├── playwright.config.ts       # Playwright VRT 設定（testDir: "./tests/vrt", testMatch: "*.spec.ts"）
├── vite.config.ts             # Vite / Vitest 設定（test.include: ["tests/unit/*.test.ts"]）
└── wrangler.jsonc             # Cloudflare Workers Static Assets 設定
```

---

## 開発コマンド (Development Commands)

```bash
# 依存パッケージのインストール
pnpm install

# ローカル開発サーバー起動 (http://localhost:3000)
pnpm run dev

# 静的解析 (Oxlint)
pnpm run lint

# コード自動整形 & チェック (Oxfmt)
pnpm run fmt
pnpm run fmt:check

# 未使用ファイル・依存・エクスポート検出 (Knip)
pnpm run knip

# 単体テスト実行 (Vitest)
pnpm run test
pnpm run test:watch

# ビジュアルリグレッションテスト実行 (Playwright)
pnpm run test:ui

# VRT ベースラインスナップショットの更新
pnpm run test:ui:update

# 型チェック ＋ プロダクションビルド
pnpm run build

# ビルド成果物のローカルプレビュー
pnpm run preview

# 個人データ JSON の書き出し & Cloudflare Workers KV 同期
pnpm run kv:export
pnpm run kv:put:local
pnpm run kv:put:remote
```

---

## 個人データの分離とカスタマイズ (`src/data/private/` & Cloudflare KV)

本リポジトリは、個人情報をバージョン管理（Git）から切り離してパブリック公開できる構成になっています。

1. **初回 Clone 時の動作（サンプルデータ）**:
   - リポジトリには汎用ダミーデータ（`src/data/sample/`）のみが含まれており、クローン直後から `pnpm run dev` / `pnpm test` / `pnpm run build` がそのまま動作します。
2. **ローカルでの個人ポートフォリオ構築（`src/data/private/`）**:
   - `.gitignore` 対象の `src/data/private/` を作成することで、ローカル開発・プレビュー・VRT時に実データが自動優先されます。
   ```bash
   cp -r src/data/sample src/data/private
   # src/data/private/{profile.ts,skills.ts,projects.ts} を自身の経歴に編集
   ```
3. **Cloudflare Workers KV での本番配信**:
   - 本番デプロイ時（`pnpm run deploy` / CI）は `VITE_IGNORE_PRIVATE_DATA=true` により `src/data/private/` を静的 JS バンドルから除外し、代わりに Turnstile 検証成功時（`POST /api/turnstile/verify`）のワンタイムレスポンスでのみ Cloudflare Workers KV（`PORTFOLIO_KV`）から実データを動的配信します。
   - 取得したデータはブラウザの `sessionStorage` にキャッシュされ、Worker 側もエッジキャッシュ（`cacheTtl: 3600`）を使用するため、Cloudflare KV の無料枠（10万回読み取り/日）に十分収まります。

### KV Namespace の設定と同期手順
`wrangler.jsonc` にアカウント固有の Namespace ID をハードコードせず、`.dev.vars` および GitHub Actions Secrets 経由で管理します。

1. Cloudflare KV Namespace を作成し、出力された `id` を控えます：
   ```bash
   pnpm exec wrangler kv namespace create PORTFOLIO_KV
   ```
2. `.dev.vars`（`.gitignore` 対象）に `CLOUDFLARE_KV_NAMESPACE_ID=<YOUR_KV_NAMESPACE_ID>` を設定し、GitHub Actions Secrets にも `CLOUDFLARE_KV_NAMESPACE_ID` を登録します（CI デプロイ時に `wrangler.jsonc` へ自動注入されます）。
3. 手元の `src/data/private/` を JSON 化して KV へアップロードします：
   ```bash
   pnpm run kv:put:remote
   ```

---

## テスト戦略 (Testing Strategy)

### 1. 単体テスト (Vitest — `*.test.ts`)
- **`tests/unit/portfolio.test.ts`**:
  - 全案件データの整合性、スキル・案件の複合フィルタロジック
  - JST 準拠の日付計算（うるう年・月境界・タイムゾーン境界での年数/月数計算）
  - 言語切替、テーマ切替、QR モーダル開閉、Turnstile ゲート画面のトークン発行・検証遷移
- **`tests/unit/worker.test.ts`**:
  - Basic 認証の暗号検証（正常認証、不一致、欠落時の 401、未設定時のフェイルクローズ 500）
  - Turnstile `POST /api/turnstile/verify` のサーバー側 `siteverify` 検証（成功 200、不正 403、パラメータ欠落 400）

### 2. ビジュアルリグレッションテスト (Playwright — `*.spec.ts`)
1px 単位のレイアウト崩れやスタイル抜けを自動検知するため、全 7 シナリオ（計 10 スナップショット）を保守性の高い 3 ファイル構成で管理しています。

- **`tests/vrt/desktop.spec.ts`**: デスクトップ表示（ダーク、ライト、英語、フィルタ選択/空状態、QRモーダル）
- **`tests/vrt/mobile.spec.ts`**: モバイルビューポート（初期表示、ハンバーガードロワー展開）
- **`tests/vrt/print.spec.ts`**: 職務経歴書モード画面表示 ＆ `@media print` 印刷プレビュー

#### フレーキー（Flaky）テスト防止策
- **Web フォント遅延ロード対策**: 撮影前に画面内の全テキストに対して Google Fonts の全ウェイトを明示的にロード完了待機。
- **非同期スクロールの即時化**: `Element.prototype.scrollIntoView` を Proxy フックし、`smooth` を `instant` に強制置換。
- **コンポジタタイルキャッシュのリフレッシュ**: スクロール座標 (0, 0) 復帰後、強制 Reflow と 2 フレーム待機で描画ブレを排除。
- **VRT 実行時刻の固定**: `page.clock.setFixedTime(...)` により、月替わりで日付や年数が変動してスナップショットが差分落ちするのを完全に防止。

---

## デプロイ & 環境変数・シークレット設定

### 1. ローカルでの Cloudflare Workers 動作確認
ローカルで Worker 経由の Basic 認証や Turnstile 検証をテストする場合は、`.dev.vars.example` を `.dev.vars` にコピーして起動します。

```bash
cp .dev.vars.example .dev.vars
pnpm run build
pnpm exec wrangler dev --port 3000
```

> **Note**: `TURNSTILE_SECRET_KEY` 未設定時のダミーキーフォールバックはローカルホスト（`localhost` / `127.0.0.1` / `[::1]`）に限定されており、本番ドメインでは安全のため `500`（フェイルクローズ）となります。

### 2. GitHub Actions による自動 CI/CD（推奨）
`main` ブランチへの push 時に、自動で **Lint → Format チェック → Knip チェック → 単体テスト → ビルド（`VITE_IGNORE_PRIVATE_DATA=true`） → Cloudflare Workers デプロイ** が実行されます。`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` が未設定のフォーク環境等ではデプロイステップは安全にスキップされます。

GitHub リポジトリの `Settings > Secrets and variables > Actions` に以下のシークレットを設定してください：

| シークレット名 | 役割 | 設定先 |
| :--- | :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Workers デプロイ権限を持つ API トークン | GitHub Actions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID | GitHub Actions |
| `CLOUDFLARE_KV_NAMESPACE_ID` | 個人データ用 KV Namespace ID（任意） | デプロイ時に `wrangler.jsonc` へ一時注入 |
| `BASIC_AUTH_USER` | 本番 Basic 認証のユーザー名 | Cloudflare Worker Secret に自動同期 |
| `BASIC_AUTH_PASS` | 本番 Basic 認証のパスワード | Cloudflare Worker Secret に自動同期 |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile の Site Key（クライアント側ウィジェット描画用） | Vite ビルド時に注入 |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile の Secret Key（Worker サーバー側 siteverify 検証用） | Cloudflare Worker Secret に自動同期 |
