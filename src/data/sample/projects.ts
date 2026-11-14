import type { ProjectItem } from "../../types/portfolio"
import { buildProjectPeriod } from "../../utils/date"

export const projectsData: ProjectItem[] = [
  {
    id: 1,
    title: {
      ja: "クラウドSaaSプラットフォーム開発（サンプル案件）",
      en: "Cloud SaaS Platform Development (Sample Project)",
    },
    ...buildProjectPeriod({ year: 2024, month: 4 }, { year: 2026, month: 3 }),
    roles: ["SE"],
    teamSize: { dev: 10, total: 16 },
    languages: ["TypeScript"],
    databases: ["PostgreSQL"],
    serverOs: ["Amazon Linux"],
    frameworksAndTools: ["React", "Next.js", "tRPC", "Docker", "GitHub"],
    phases: [
      "requirements",
      "basic_design",
      "detailed_design",
      "implementation",
      "unit_test",
      "integration_test",
      "maintenance",
    ],
    responsibilities: {
      ja: "Webアプリケーションのフロントエンド〜APIアーキテクチャ設計・実装",
      en: "Frontend and API architecture design and full-stack implementation",
    },
    acquiredSkills: [
      {
        ja: "TypeScript + tRPC を用いたエンドツーエンド型安全開発",
        en: "End-to-end type-safe architecture with TypeScript and tRPC",
      },
    ],
    comment: {
      ja: "設計からテスト自動化まで一貫して担当し、継続的デリバリーの品質向上に貢献しました（サンプルデータ）。",
      en: "Owned architecture through automated testing to improve continuous delivery quality (Sample data).",
    },
    evaluation: {
      ja: "仕様整理から実装までスピーディーかつ高品質に推進いただいた。",
      en: "Drove specification alignment through implementation with high speed and quality.",
    },
  },
  {
    id: 2,
    title: {
      ja: "データ分析基盤・PM推進支援（サンプル案件）",
      en: "Data Analytics Platform & PM Support (Sample Project)",
    },
    ...buildProjectPeriod({ year: 2022, month: 1 }, { year: 2024, month: 3 }),
    roles: ["PM"],
    teamSize: { team: 5, dev: 8, total: 14 },
    languages: ["TypeScript", "Go"],
    databases: ["PostgreSQL", "MySQL"],
    serverOs: ["Amazon Linux"],
    frameworksAndTools: ["React", "Node.js", "Docker", "Vitest", "GitHub"],
    phases: [
      "requirements",
      "basic_design",
      "detailed_design",
      "implementation",
      "integration_test",
    ],
    responsibilities: {
      ja: "要件定義、WBS・スケジュール管理、開発チーム進行統括",
      en: "Requirements definition, WBS/schedule management, and cross-team delivery leadership",
    },
    acquiredSkills: [
      {
        ja: "ステークホルダー調整およびGolangを用いた高負荷API設計",
        en: "Stakeholder alignment and high-throughput API design with Golang",
      },
    ],
    comment: {
      ja: "事業部門と開発チームの橋渡し役として、段階的なリリース計画を策定・完遂しました（サンプルデータ）。",
      en: "Bridged business stakeholders and engineering teams to execute phased production releases (Sample data).",
    },
  },
  {
    id: 3,
    title: {
      ja: "業務管理ポータル刷新プロジェクト（サンプル案件）",
      en: "Enterprise Operations Portal Renewal (Sample Project)",
    },
    ...buildProjectPeriod({ year: 2019, month: 6 }, { year: 2021, month: 12 }),
    roles: ["PMO", "SE"],
    teamSize: { team: 6, dev: 6, maintenance: 2, total: 10 },
    languages: ["TypeScript", "JavaScript"],
    databases: ["MySQL"],
    serverOs: ["Linux"],
    frameworksAndTools: ["React", "Next.js", "Docker", "GitHub"],
    phases: [
      "basic_design",
      "detailed_design",
      "implementation",
      "unit_test",
      "maintenance",
    ],
    responsibilities: {
      ja: "管理画面UIの設計・実装、進捗管理および課題整理サポート",
      en: "Admin UI design and implementation, progress tracking, and issue triage support",
    },
    acquiredSkills: [
      {
        ja: "レガシーシステムからの段階的リプレイス設計手法",
        en: "Incremental migration patterns from legacy systems",
      },
    ],
    comment: {
      ja: "既存運用の業務フローを維持しながら段階的にUI/APIをモダン化しました（サンプルデータ）。",
      en: "Modernized UI and APIs incrementally without disrupting ongoing operations (Sample data).",
    },
  },
]
