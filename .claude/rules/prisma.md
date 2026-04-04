# Prisma / DB 規約 (packages/db)

- スキーマ: packages/db/prisma/schema.prisma
- 全テーブルに tenantId を持たせる（マルチテナント）
- マイグレーション手順: `pnpm db:generate` → `pnpm db:migrate`
- seed は packages/db/prisma/seed.ts に配置
- enum は Prisma schema 内で定義し、shared パッケージへ再エクスポート
- カラム名は camelCase、テーブル名は PascalCase（Prisma デフォルト）
- インデックス: tenantId を含む複合インデックスを忘れない
