依存パッケージの脆弱性と更新をチェックし、必要に応じて Issue を作成する。

## 手順

1. `pnpm audit --json` で脆弱性を確認
2. `pnpm outdated --json` でメジャーアップデートを確認
3. 脆弱性が見つかった場合:
   - severity が high/critical → `gh issue create --label "security,priority:high"` で Issue 作成
   - severity が moderate → `gh issue create --label "security,priority:medium"`
4. メジャーアップデートがある場合:
   - フレームワーク系（next, nestjs, prisma）→ Issue 作成（手動対応推奨）
   - ツール系 → 自動で `pnpm update` + テスト + PR 作成
5. 結果を報告
