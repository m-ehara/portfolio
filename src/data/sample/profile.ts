import type {
  CareerPeriodSummary,
  PhaseExperience,
  ProfileInfo,
  RoleExperience,
  SpecialtyItem,
} from "../../types/portfolio"
import { formatYearMonthSlash } from "../../utils/date"
import {
  DEFAULT_PORTFOLIO_QR_SVG_PATH,
  DEFAULT_PORTFOLIO_URL,
} from "../constants"

export const profileInfo: ProfileInfo = {
  updatedAt: formatYearMonthSlash(),
  name: {
    ja: "山田 太郎",
    en: "Taro Yamada",
  },
  handle: "sample-dev",
  githubUrl: "https://github.com/example",
  brandName: "T.Yamada",
  brandRole: "Full-Stack & PM",
  portfolioUrl: DEFAULT_PORTFOLIO_URL,
  portfolioQrSvgPath: DEFAULT_PORTFOLIO_QR_SVG_PATH,
  careerStart: { year: 2016, month: 4 },
  freelanceStart: { year: 2020, month: 1 },
  featuredStack: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "tRPC",
    "Go",
    "AWS",
    "Docker",
    "PostgreSQL",
  ],
  jobTitle: {
    ja: "Web アプリケーションエンジニア / プロジェクトマネージャー",
    en: "Web Application Engineer & Project Manager",
  },
  tagline: {
    ja: "サンプルデータ表示中です。src/data/private/ を作成するか Cloudflare KV にデータを配置することで、ご自身の経歴・スキルシートに差し替えられます。",
    en: "Displaying generic sample data. Create src/data/private/ locally or configure Cloudflare Workers KV to serve your own portfolio and skill sheet.",
  },
}

export const specialtiesData: SpecialtyItem[] = [
  {
    id: "scale",
    title: {
      ja: "アジャイル開発から大規模プロジェクト推進まで",
      en: "Agile Prototyping to Large-Scale Delivery",
    },
    description: {
      ja: "スタートアップのMVP構築からエンタープライズ向けスクラム開発まで、フェーズに応じた最適な開発プロセスを構築",
      en: "Adapting engineering workflows from rapid startup MVP builds to structured enterprise Scrum delivery.",
    },
  },
  {
    id: "saas",
    title: {
      ja: "SaaSプロダクトの設計・立ち上げ・運用改善",
      en: "End-to-End SaaS Architecture & Growth",
    },
    description: {
      ja: "BtoB/BtoC向けWebサービスの要件定義から技術選定、アーキテクチャ設計、継続的改善まで一貫して主導",
      en: "Leading requirements definition, technical architecture, and iterative improvements across B2B/B2C SaaS products.",
    },
  },
  {
    id: "bridge",
    title: {
      ja: "ビジネス側とエンジニアチームを繋ぐ推進力",
      en: "Cross-Functional Leadership & Delivery",
    },
    description: {
      ja: "ステークホルダーとの要件調整、WBS策定、リスク管理を通じてプロジェクトを確実なリリースへ導く推進力",
      en: "Aligning stakeholders and engineering teams through structured WBS planning and transparent risk management.",
    },
  },
  {
    id: "fullstack",
    title: {
      ja: "フロントエンド〜バックエンド〜クラウドの一気通貫開発",
      en: "Full-Stack Web & Cloud Engineering",
    },
    description: {
      ja: "TypeScriptを中心とした型安全なSPA/API開発と、コンテナ・クラウドインフラ・CI/CDの構築",
      en: "Type-safe frontend and API engineering with TypeScript, paired with cloud infrastructure and CI/CD automation.",
    },
    details: [
      {
        ja: "フロントエンド：React / Next.js を用いた保守性の高いUI設計",
        en: "Frontend: Maintainable component architecture using React and Next.js",
      },
      {
        ja: "バックエンド：Node.js / Go / tRPC による堅牢なAPI設計と実装",
        en: "Backend: Robust schema-driven API implementation with Node.js, Go, and tRPC",
      },
      {
        ja: "インフラ・CI/CD：Docker / AWS / GitHub Actions による自動デプロイ基盤構築",
        en: "Infrastructure & CI/CD: Automated container pipelines with Docker, AWS, and GitHub Actions",
      },
    ],
  },
  {
    id: "ai-driven",
    title: {
      ja: "AI支援ツールを活用した開発生産性の向上",
      en: "AI-Augmented Development Workflows",
    },
    description: {
      ja: "生成AIや自動テストを組み合わせた高品質・高速な開発ワークフローの導入と標準化",
      en: "Integrating generative AI tooling and automated testing guardrails to accelerate engineering velocity.",
    },
  },
]

export const careerSummariesData: CareerPeriodSummary[] = [
  {
    id: "freelance",
    title: {
      ja: "フリーランスエンジニア / PM（サンプル）",
      en: "Freelance Engineer / PM (Sample)",
    },
    period: {
      ja: "2020年1月 ～ 現在",
      en: "January 2020 – Present",
    },
    description: {
      ja: "新規SaaS立ち上げのリードエンジニアおよびプロジェクトマネージャーとして、技術選定・アーキテクチャ設計・実装・チーム進行管理を担当（サンプルデータ）。",
      en: "Served as Lead Engineer and Project Manager for greenfield SaaS launches, overseeing architecture design, implementation, and team delivery (Sample data).",
    },
  },
  {
    id: "inhouse",
    title: {
      ja: "システムエンジニア（サンプル）",
      en: "Systems Engineer (Sample)",
    },
    period: {
      ja: "2016年4月 ～ 2019年12月",
      en: "April 2016 – December 2019",
    },
    description: {
      ja: "Webアプリケーション開発企業にてバックエンドおよびフロントエンド開発に従事。設計・実装・テストおよび顧客折衝を経験（サンプルデータ）。",
      en: "Developed web applications across frontend and backend layers, handling system design, implementation, testing, and client coordination (Sample data).",
    },
  },
]

export const roleExperiencesData: RoleExperience[] = [
  { role: "CTO", label: { ja: "CTO", en: "CTO" }, rank: "-" },
  { role: "VPoE", label: { ja: "VPoE", en: "VPoE" }, rank: "-" },
  { role: "PM", label: { ja: "PM", en: "PM" }, rank: "◎" },
  { role: "PMO", label: { ja: "PMO", en: "PMO" }, rank: "●" },
  { role: "PL", label: { ja: "PL", en: "PL" }, rank: "◎" },
  { role: "SE", label: { ja: "SE", en: "SE" }, rank: "★" },
  { role: "PG", label: { ja: "PG", en: "PG" }, rank: "★" },
  { role: "Tester", label: { ja: "Tester", en: "Tester" }, rank: "●" },
]

export const phaseExperiencesData: PhaseExperience[] = [
  {
    id: "planning",
    label: { ja: "企画/提案", en: "Planning / Proposal" },
    rank: "●",
  },
  {
    id: "requirements",
    label: { ja: "要件定義", en: "Requirements" },
    rank: "◎",
  },
  {
    id: "basic_design",
    label: { ja: "基本設計", en: "Basic Design" },
    rank: "★",
  },
  {
    id: "detailed_design",
    label: { ja: "詳細設計", en: "Detailed Design" },
    rank: "★",
  },
  {
    id: "implementation",
    label: { ja: "コーディング", en: "Coding" },
    rank: "★",
  },
  {
    id: "maintenance",
    label: { ja: "保守運用", en: "Maintenance & Ops" },
    rank: "◎",
  },
]
