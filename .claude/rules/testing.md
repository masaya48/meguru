# テスト方針

## Unit テスト
- Service 層のビジネスロジック（必須）
- 外部依存は mock。DB は PrismaService を mock
- ファイル: *.spec.ts に co-locate

## Integration テスト
- Controller + Service + DB の結合
- テスト用 Docker PostgreSQL を使用
- ファイル: *.integration-spec.ts

## E2E テスト
- API エンドポイントの主要フロー
- supertest 経由で HTTP リクエスト
- ファイル: apps/api/test/*.e2e-spec.ts

## 原則
- テストは振る舞いを検証する。実装詳細に依存しない
- mock は最小限。本物を使えるなら使う
- テストデータは各テスト内で作成・片付け
