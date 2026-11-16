import type { PhaseKey, SkillCategoryKey, SkillRank } from "../types/portfolio"

export const RANK_SCORE: Record<SkillRank, number> = {
  "★": 5,
  "◎": 4,
  "●": 3,
  "○": 2,
  "△": 1,
}

export const RANK_LEGEND: Array<{
  rank: SkillRank
  ja: string
  en: string
}> = [
  {
    rank: "★",
    ja: "業務経験5年以上",
    en: "5+ yrs experience",
  },
  {
    rank: "◎",
    ja: "業務経験3年以上",
    en: "3+ yrs experience",
  },
  {
    rank: "●",
    ja: "業務経験1年以上",
    en: "1+ yr experience",
  },
  {
    rank: "○",
    ja: "業務経験あり",
    en: "Practical experience",
  },
  { rank: "△", ja: "知識あり", en: "Knowledge" },
]

export const SKILL_CATEGORIES: Array<{
  key: SkillCategoryKey | "all"
  ja: string
  en: string
}> = [
  { key: "all", ja: "すべて", en: "All" },
  { key: "language", ja: "言語", en: "Languages" },
  { key: "framework", ja: "FW / ライブラリ", en: "Frameworks & Libs" },
  { key: "db", ja: "データベース", en: "Databases" },
  { key: "infra", ja: "インフラ", en: "Infrastructure" },
  { key: "os", ja: "OS", en: "OS" },
  { key: "ai", ja: "AI ツール", en: "AI Tools" },
  { key: "other", ja: "その他・DevOps", en: "DevOps & Tools" },
]

export const PROJECT_PHASES: Array<{
  key: PhaseKey
  ja: string
  en: string
}> = [
  {
    key: "requirements",
    ja: "要件定義",
    en: "Requirements",
  },
  {
    key: "basic_design",
    ja: "基本設計",
    en: "Basic Design",
  },
  {
    key: "detailed_design",
    ja: "詳細設計",
    en: "Detailed Design",
  },
  {
    key: "implementation",
    ja: "実装・単体",
    en: "Implementation",
  },
  {
    key: "unit_test",
    ja: "単体テスト",
    en: "Unit Test",
  },
  {
    key: "integration_test",
    ja: "結合テスト",
    en: "Integration Test",
  },
  {
    key: "maintenance",
    ja: "保守・運用",
    en: "Maintenance & Ops",
  },
]

export const DEFAULT_PORTFOLIO_URL = "https://portfolio.example.com/"

export const PORTFOLIO_DATA_STORAGE_KEY = "portfolio_data_cache"

export const TURNSTILE_VERIFY_STORAGE_KEY = "portfolio_turnstile_verified"

export const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

// Cloudflare official dummy site key for local development / testing
export const TURNSTILE_DUMMY_SITE_KEY = "1x00000000000000000000AA"

// Generic sample QR SVG path (finder patterns + placeholder modules) for sample/default mode
export const DEFAULT_PORTFOLIO_QR_SVG_PATH =
  "M4,4h7v1h-7zM4,5h1v5h-1zM10,5h1v5h-1zM6,6h3v3h-3zM4,10h7v1h-7zM26,4h7v1h-7zM26,5h1v5h-1zM32,5h1v5h-1zM28,6h3v3h-3zM26,10h7v1h-7zM4,26h7v1h-7zM4,27h1v5h-1zM10,27h1v5h-1zM6,28h3v3h-3zM4,32h7v1h-7zM14,4h2v1h-2zM18,4h3v1h-3zM13,6h1v3h-1zM16,6h2v2h-2zM21,6h2v2h-2zM14,10h4v1h-4zM20,10h3v1h-3zM4,14h3v2h-3zM9,14h3v1h-3zM14,14h4v2h-4zM20,14h3v2h-3zM26,14h3v2h-3zM31,14h2v3h-2zM6,18h3v2h-3zM12,18h2v3h-2zM17,18h3v2h-3zM23,18h2v3h-2zM28,18h3v2h-3zM4,22h2v2h-2zM10,22h3v2h-3zM16,22h4v2h-4zM24,22h5v1h-5zM24,23h1v4h-1zM28,23h1v4h-1zM26,25h1v1h-1zM24,27h5v1h-5zM14,26h3v2h-3zM19,26h3v1h-3zM13,30h4v2h-4zM20,29h2v3h-2zM25,30h3v2h-3zM30,29h3v3h-3z"
