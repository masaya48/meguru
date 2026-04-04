PR マージ前の品質ゲートチェックを実施する。

引数: なし（現在のブランチを対象）、または PR番号

## チェック項目

1. **Lint & Format**
   - `pnpm format:check` — フォーマット違反がないか
   - `pnpm lint` — oxlint + ESLint のエラーがないか

2. **テスト**
   - `pnpm test` — 全ユニットテストがパスするか
   - カバレッジが変更前より下がっていないか

3. **型チェック**
   - `pnpm -r --if-present run typecheck` — TypeScript の型エラーがないか

4. **ADR/Spec 整合性**
   - 変更ファイルに関連する ADR/Spec（context-map.md 参照）を読み
   - 実装が設計と矛盾していないか確認

5. **セキュリティ**
   - .env / credentials / secrets がコミットに含まれていないか
   - `pnpm audit` で新規の脆弱性が入っていないか

6. **コミットメッセージ**
   - Conventional Commits に従っているか
   - Issue 番号が紐付いているか

## 結果

- 全パス → "Ready to merge" と報告
- 失敗あり → 問題点をリストアップし、修正方法を提案
