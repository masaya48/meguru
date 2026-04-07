---
name: db-reset
description: 開発DBをリセットする。
---

開発DBをリセットする。

1. ユーザーに確認を取る（破壊的操作のため）
2. `npx prisma migrate reset --force` を packages/db で実行
3. `pnpm db:seed` でテストデータ再投入
4. 結果を報告
