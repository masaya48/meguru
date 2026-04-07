---
name: learn-from-review
description: PR のレビューコメントを読み込み、再発防止のためルールに反映する。
argument-hint: "[pr-number]"
---

PR のレビューコメントを読み込み、再発防止のためルールに反映する。

引数: PR番号 (例: `/learn-from-review 15`)

## 手順

1. `gh pr view $ARGUMENTS --json title,body,reviews,comments` で PR 情報を取得
2. `gh api repos/{owner}/{repo}/pulls/$ARGUMENTS/comments` でインラインコメントを取得
3. レビュー指摘を分類:
   - **バグ/ロジックミス** → 該当ドメインの rules に予防ルールを追記
   - **コード品質** → rules/testing.md または該当ファイルに追記
   - **設計指摘** → 関連 ADR の更新を検討
   - **好評/LGTM パターン** → 良いパターンとして rules に記録
4. `.claude/rules/` の該当ファイルに学びを追記
5. 変更があれば `git commit -m "chore: update rules from PR #番号 review"`
6. 追記した内容を報告
