Prisma マイグレーションを実行する。

1. `pnpm db:generate` で Prisma Client を再生成
2. `pnpm db:migrate` でマイグレーション適用
3. 結果を報告（成功/失敗、適用されたマイグレーション名）
