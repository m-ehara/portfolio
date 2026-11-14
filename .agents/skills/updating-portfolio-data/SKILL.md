---
name: updating-portfolio-data
description: >-
  スキルシートの更新、新規プロジェクト（案件実績）の追加、スキル評価ランク・経験年数の変更、
  自己PR・経歴概要の編集、および日英バイリンガル（ja/en）データの同期を行うスキル。
  Use this skill when the user asks to add a new project, update skill experience
  years/ranks, modify profile or PR text, or sync the portfolio with an updated
  skill sheet (案件追加, スキル更新, 経歴・スキルシートの反映, プロフィール編集, 多言語テキスト更新).
compatibility: Requires Node.js >= 20 and pnpm.
---

# ポートフォリオ・スキルシートデータの更新手順

このスキルは、日英バイリンガル（`ja` / `en`）の整合性、スキル・案件連動フィルタ、および職務経歴書モード（A4印刷レイアウト）を崩さずにデータを追加・更新する手順を定義します。

## 実行ステップ

1. **データスキーマと定数の確認**:
   - 編集前に必ず [references/data-schema.md](./references/data-schema.md) を参照し、型定義（`ProjectItem`, `SkillItem`, `SkillRank`, `PhaseKey`）および評価記号・担当工程キーの仕様を確認してください。

2. **対象データファイルの更新**:
   - 実データは `.gitignore` 対象の `src/data/private/`（存在しない場合は `cp -r src/data/sample src/data/private` で作成）に配置されています。サンプル構成自体を更新する場合のみ `src/data/sample/` を編集してください。
   - **案件実績の追加・編集（`src/data/private/projects.ts`）**:
     - 新規案件は原則として `projectsData` 配列の先頭（最新順）に追加し、`id` を採番します。
     - すべてのテキスト項目（`title`, `period`, `durationLabel`, `responsibilities`, `acquiredSkills`, `comment`, `evaluation`）に必ず `ja` と `en` の両方を記述してください。
     - `languages`, `databases`, `serverOs`, `frameworksAndTools` に記述する技術名は、`src/data/private/skills.ts` の `name` と表記を揃えてください（クリック連動フィルタの精度維持のため）。
   - **スキルの追加・評価変更（`src/data/private/skills.ts`）**:
     - `rank` には `"★"`（5年以上）、`"◎"`（3年以上）、`"●"`（1年以上）、`"○"`（業務経験あり）、`"△"`（知識あり）のいずれかを指定し、`yearsLabel`（`ja` / `en`）もランクに合わせて更新します。
   - **基本プロフィール・自己PR・経歴概要の編集（`src/data/private/profile.ts`）**:
     - スキルシートの更新日を反映する場合は `profileInfo.updatedAt`（`"YYYY/MM"` 形式）を確認し、ブランド名（`brandName`, `brandRole`）、開始年月（`careerStart`, `freelanceStart`）、URL・QRパス（`portfolioUrl`, `portfolioQrSvgPath`）、`featuredStack` もここで管理します。

3. **フォーマットと検証の実行**:
   - `pnpm run fmt` でコードを整形し、`pnpm run lint`・`pnpm run test`・`pnpm run build` がすべてパスすることを確認します。
   - 本番環境の Cloudflare Workers KV へ反映する場合は `pnpm run kv:put:remote` を実行します。
