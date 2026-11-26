---
name: evaluating-pnpm-build-scripts
description: >-
  pnpm install 時の「Ignored build scripts (ERR_PNPM_IGNORED_BUILDS)」エラーに対して、
  依存パッケージのライフサイクルスクリプト（preinstall / install / postinstall）の安全性と必要性を評価し、
  3分類（許可: true / 無視: false / 未分類）で pnpm-workspace.yaml の allowBuilds を管理するスキル。
  Use this skill when adding or updating dependencies with pnpm, encountering
  "Ignored build scripts" or ERR_PNPM_IGNORED_BUILDS, or auditing package lifecycle scripts
  (pnpm installエラー, Ignored build scripts, ERR_PNPM_IGNORED_BUILDS, postinstall評価, allowBuilds, サプライチェーンセキュリティ).
compatibility: Requires Node.js >= 20 and pnpm >= 11.
---

# pnpm ビルドスクリプト（Lifecycle Scripts）評価・分類手順

このスキルは、pnpm（v11/v12+）のデフォルト厳格チェック環境下において、依存パッケージのライフサイクルスクリプト（`preinstall` / `install` / `postinstall`）によるサプライチェーン攻撃を防ぎつつ、安全性と実行要否を評価して `pnpm-workspace.yaml` の `allowBuilds` に適切に分類・記録する手順を定義します。

## 基本原則

- **思考停止の全許可（`pnpm approve-builds --all`）は厳禁**: セキュリティ機構の意味が失われるため、必ずパッケージごとにスクリプトの実体を読んで個別に判断してください。
- **`pnpm-workspace.yaml` の `allowBuilds` による3分類管理**:
  1. **許可（`<pkg>: true`）**: ネイティブバインディングのソースビルドなど、スクリプトを実行しないと動作せず、かつコードに不審な処理がないことを確認したもの。
  2. **無視（`<pkg>: false`）**: `optionalDependencies` 等でプラットフォーム別のプリビルトバイナリが既に配布・配置されているケースや、単なるバナー・案内メッセージ表示のみで実行が不要と判断したもの。
  3. **未分類（`allowBuilds` に記載しない）**: まだ評価していないもの、または挙動が不審・不明なもの。未分類のまま残すことで `ERR_PNPM_IGNORED_BUILDS` により未審査のスクリプト実行を防止します。

## 実行ステップ

1. **未分類パッケージの特定**:
   - `pnpm install` の `ERR_PNPM_IGNORED_BUILDS` エラー出力、または `pnpm ignored-builds` から、未分類のパッケージ名を確認します。

2. **スクリプト実体とプリビルトバイナリの精査**:
   - 対象パッケージの `package.json` の `scripts` / `optionalDependencies` と、実行されるスクリプトのソースコードを直接確認します：
     ```bash
     # 1. scripts と optionalDependencies の確認
     cat node_modules/.pnpm/<pkg>@*/node_modules/<pkg>/package.json

     # 2. スクリプト本体のコード精査（外部通信、不審なコマンド実行、環境変数送信がないか確認）
     cat node_modules/.pnpm/<pkg>@*/node_modules/<pkg>/<script-file>

     # 3. プリビルトバイナリ（optionalDependencies）およびエントリポイント解決方法の確認
     ls -d node_modules/.pnpm/@<scope>+* node_modules/.pnpm/<pkg>-* 2>/dev/null
     ```

3. **分類の決定と `pnpm-workspace.yaml` の更新**:
   - `pnpm-workspace.yaml` の `allowBuilds` マップに対象パッケージを追加し（許可なら `true`、無視なら `false`）、**「なぜその分類と判定したか」の根拠を直上に YAML コメント（`#`）として必ず記録**します。
   - または `pnpm approve-builds <pkg>`（許可） / `pnpm approve-builds '!<pkg>'`（無視）を実行した上で、`pnpm-workspace.yaml` に判断根拠のコメントを追記します。

4. **動作確認**:
   - `pnpm install` および `pnpm ignored-builds` を実行し、`ERR_PNPM_IGNORED_BUILDS` や未分類の警告が出ないことを確認します。
   - `pnpm run lint`、`pnpm run knip`、`pnpm test`、`pnpm run build` を実行し、対象パッケージが正常に機能することを検証します。
