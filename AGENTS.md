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

## Rules

- 日本語でコミュニケーション
- コミットメッセージは英語 (Conventional Commits)
- 既存パターンに従う。不要なリファクタリングはしない
- タスクのスコープ外の作業をしない
