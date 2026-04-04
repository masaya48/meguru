GitHub Issue を読み込み、ブランチ作成から PR 作成まで一気通貫で実施する。

引数: Issue番号 (例: `/work-on-issue 42`)

## 手順

1. `gh issue view $ARGUMENTS --json title,body,labels,assignees` で Issue を取得
2. Issue の内容を分析し、関連する ADR/Spec を特定する
   - labels に `api` → docs/adr/001-tech-stack.md, docs/spec/001-system-architecture.md
   - labels に `web` → docs/adr/006-ui-components.md, docs/spec/003-ui-spec.md
   - labels に `db` → docs/spec/002-data-model.md
   - labels に `auth` → docs/adr/003-authentication.md, docs/adr/009-simplified-auth.md
   - labels に `line` → docs/adr/005-line-integration.md, docs/spec/004-line-integration.md
   - labels に `tenant` → docs/adr/004-multi-tenancy.md, docs/adr/008-subdomain-tenant-and-rls.md
3. 関連 ADR/Spec を読み、コンテキストを把握する
4. `git switch -c feat/issue-{番号}-{slug}` でブランチ作成（slug は Issue タイトルから英語で短く生成）
5. 実装計画を立てる（大きい場合は writing-plans skill を使用）
6. 実装 → テスト → コミット（Conventional Commits、本文に `refs #番号`）
7. `gh pr create` で PR 作成。本文に:
   - Closes #番号
   - 変更サマリ
   - テスト計画
