# ポートフォリオ データスキーマ リファレンス

型定義は `src/types/portfolio.ts`、定数は `src/data/constants.ts` で管理されています。

## 1. スキル評価ランク (`SkillRank`)

| 記号 | スコア (`RANK_SCORE`) | `yearsLabel.ja` | `yearsLabel.en` |
| :--- | :--- | :--- | :--- |
| `"★"` | `5` | `"5年以上"` | `"5+ yrs"` |
| `"◎"` | `4` | `"3年以上"` | `"3+ yrs"` |
| `"●"` | `3` | `"1年以上"` | `"1+ yr"` |
| `"○"` | `2` | `"業務経験あり"` | `"Practical exp"` |
| `"△"` | `1` | `"知識あり"` | `"Knowledge"` |

## 2. スキルカテゴリ (`SkillCategoryKey`)

- `"language"`: プログラミング言語・マークアップ言語（例: `TypeScript`, `Go`, `PHP`）
- `"framework"`: FW・ライブラリ・テストツール（例: `React`, `Next.js`, `Nest.js`, `tRPC`）
- `"db"`: RDBMS / NoSQL / ORM（例: `PostgreSQL`, `MySQL`, `MongoDB`, `Prisma`）
- `"infra"`: クラウド・サーバーインフラ（例: `AWS`, `GCP`, `Azure`）
- `"os"`: OS（`Linux`, `macOS`, `Windows`）
- `"ai"`: AI開発支援ツール（`Claude (Sonnet 4.x / Opus 4.x)`, `Codex (GPT-5.x)`, `Gemini`, `NotebookLM`）
- `"other"`: DevOps・CI/CD・コンテナ・デザインツール（`Git / GitHub`, `GitHub Actions`, `Docker`, `Figma`）

## 3. 担当工程キー (`PhaseKey`)

`ProjectItem.phases` 配列に指定可能なキー一覧：

- `"requirements"`: 要件定義
- `"basic_design"`: 基本設計
- `"detailed_design"`: 詳細設計
- `"implementation"`: 実装・単体
- `"unit_test"`: 単体テスト
- `"integration_test"`: 結合テスト
- `"maintenance"`: 保守・運用

（※ `"planning"`（企画/提案）は `src/data/private/profile.ts`（または `src/data/sample/profile.ts`）の全体工程経験 `phaseExperiencesData` で使用します）

## 4. `ProjectItem` 追加テンプレート

```ts
{
  id: 1,
  title: {
    ja: "プロジェクト名",
    en: "Project Title",
  },
  // 終了年月（第2引数）を省略すると「〜 現在 / – Present」として当月までの月数を自動算出
  ...buildProjectPeriod({ year: 2025, month: 2 }, { year: 2026, month: 3 }),
  roles: ["SE"], // 例: ["PM"], ["PMO", "SE"], ["SE"]
  teamSize: { team: 5, dev: 17, total: 30 }, // team, dev, maintenance は任意、total は必須
  languages: ["TypeScript"],
  databases: ["PostgreSQL"],
  serverOs: ["Amazon Linux"],
  frameworksAndTools: ["Next.js", "Nest.js", "tRPC", "Docker"],
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
    ja: "担当業務の説明",
    en: "Description of responsibilities",
  },
  acquiredSkills: [
    { ja: "習得スキル1", en: "Acquired skill 1" },
  ],
  comment: {
    ja: "取り組み・コメント",
    en: "Summary and contributions",
  },
  evaluation: {
    ja: "現場からの評価（任意）",
    en: "Client or team evaluation (optional)",
  },
}
```
