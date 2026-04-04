# meguru - 町内会・自治会向け回覧板SaaS

## Tech Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Backend:** NestJS + Prisma
- **DB:** PostgreSQL
- **Monorepo:** pnpm workspace
- **Lint/Format:** oxlint + oxfmt (メイン), ESLint (補完)
- **Pre-commit:** lefthook
- **CI:** GitHub Actions

## Project Structure

```
apps/web/     → Next.js (住民向け + 管理者向け)
apps/api/     → NestJS API
packages/db/  → Prisma スキーマ + クライアント
packages/shared/ → 共通型定義・ユーティリティ
```

## Docs Index

| Doc | Path |
|-----|------|
| PRD | [docs/prd/001-meguru-mvp.md](docs/prd/001-meguru-mvp.md) |
| Tech Stack | [docs/adr/001-tech-stack.md](docs/adr/001-tech-stack.md) |
| Monorepo & Tooling | [docs/adr/002-monorepo-and-tooling.md](docs/adr/002-monorepo-and-tooling.md) |
| Auth | [docs/adr/003-authentication.md](docs/adr/003-authentication.md) |
| Multi-tenancy | [docs/adr/004-multi-tenancy.md](docs/adr/004-multi-tenancy.md) |
| LINE Integration | [docs/adr/005-line-integration.md](docs/adr/005-line-integration.md) |
| UI Components | [docs/adr/006-ui-components.md](docs/adr/006-ui-components.md) |
| Architecture | [docs/spec/001-system-architecture.md](docs/spec/001-system-architecture.md) |
| Data Model | [docs/spec/002-data-model.md](docs/spec/002-data-model.md) |
| UI Spec | [docs/spec/003-ui-spec.md](docs/spec/003-ui-spec.md) |
| Design System | [docs/design-system/design-system.md](docs/design-system/design-system.md) |

## Commands

| Command | Description |
|---------|-------------|
| `/work-on-issue {n}` | Issue を読み込み、ブランチ→実装→PR まで一気通貫 |
| `/triage-issue {n}` | Issue にラベル・優先度・サイズを付与 |
| `/learn-from-review {n}` | PR レビューから学びを rules に反映 |
| `/audit-deps` | 依存パッケージの脆弱性・更新チェック |
| `/audit-code` | コード品質監査 → tech-debt Issue 作成 |
| `/quality-gate` | PR マージ前の品質ゲートチェック |
| `/check` | lint + format + test 一括実行 |
| `/migrate` | Prisma マイグレーション実行 |
| `/seed` | テストデータ投入 |
| `/db-reset` | 開発 DB リセット |

## Branch Strategy

- **main** — 本番相当。直接コミット禁止。PR経由のみ
- **feat/issue-{n}-{slug}** — 機能開発。Issue から `/work-on-issue` で作成
- **fix/issue-{n}-{slug}** — バグ修正
- **chore/{slug}** — 設定・ドキュメント・依存更新

main への直接 push は docs/ と .claude/ の変更のみ許可。コード変更は必ずブランチ→PR。

## Rules

- 日本語でコミュニケーション
- コミットメッセージは英語 (Conventional Commits)
- 既存パターンに従う。不要なリファクタリングはしない
- タスクのスコープ外の作業をしない
- ファイル編集前に .claude/rules/context-map.md を参照し、関連 ADR/Spec を読む
- コード変更は必ずブランチを切って PR 経由でマージする
