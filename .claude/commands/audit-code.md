コードベースの品質を監査し、tech-debt Issue を作成する。

## 手順

1. dead code / unused exports の検出
   - `pnpm oxlint .` の警告を分析
   - 未使用の export を grep で検出
2. テストカバレッジの確認
   - `pnpm test -- --coverage` でカバレッジレポートを取得
   - カバレッジが低いモジュール（< 60%）をリストアップ
3. 大きすぎるファイルの検出（200行超）
4. ADR/Spec と実装の乖離チェック
   - docs/spec/ の仕様と実際のAPIエンドポイントを突合
5. 発見した問題ごとに `gh issue create --label "tech-debt"` で Issue 作成
6. 結果サマリを報告
