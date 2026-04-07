# ADR-008: サブドメインテナント識別 + PostgreSQL RLS

## ステータス

承認済み（設計のみ。実装はMVP後）

## コンテキスト

ADR-004でテナントIDカラム方式���採用した。現在はアプリ層（NestJS TenantInterceptor）でフィルタしているが、以下の課題がある:

1. **テナント識別**: ログイン時にslugを手入力する必要があり、UXが悪い
2. **データ分離の堅牢性**: アプリ層のフィルタ漏れがデータ漏洩に直結する

## 決定

### 1. サブドメインによるテナント識別

`{slug}.meguru.app` 形式のサブドメインでテナントを識別する。

**アーキテクチャ:**

```
リクエスト: https://sakura-cho.meguru.app/
  ↓
Next.js Middleware (middleware.ts)
  ├── Host ヘッダーからサブドメイン抽出
  ├── DB/キャッシュでテナント解決 (slug → tenantId)
  ├── 見つからない → 404テナントページ
  └── リクエストヘッダーに X-Tenant-Id を付与
  ↓
App (テナントコンテキストが確定した状態)
```

**Next.js Middleware の実装方針:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const subdomain = host.split(".")[0];

  // meguru.app (ルートドメイン) → ランディングページ
  if (subdomain === "meguru" || subdomain === "www") {
    return NextResponse.next();
  }

  // サブドメイン → テナントslugとして扱う
  const response = NextResponse.next();
  response.headers.set("x-tenant-slug", subdomain);
  return response;
}
```

**ローカル開発:**

- `*.localhost` を使用（ブラウザが自動解決）
- `sakura-cho.localhost:3000` でアクセス
- `.env.local` に `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000` を設定

**Vercel デプロイ:**

- ワイルドカードドメイン `*.meguru.app` を設定
- Vercelはワイルドカードサブドメインをネイティブサポート

### 2. PostgreSQL Row Level Security (RLS)

アプリ層のフィルタに加え、DB層でもテナント分離を強制する。

**設計方針:**

```sql
-- RLSを有効化（テナントIDを持つ全テーブルに適用）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- アプリケーション用ロール
CREATE ROLE app_user;

-- ポリシー: current_setting('app.current_tenant_id') と一致する行のみ操作可能
CREATE POLICY tenant_isolation ON users
  USING ("tenantId" = current_setting('app.current_tenant_id')::uuid);

-- 全テナントテーブルに同様のポリシーを適用:
-- users, groups, circulars, circular_reads, circular_questions,
-- circular_answers, templates, invitations, notifications
```

**Prisma との統合:**

Prismaはコネクションプールを使うため、リクエストごとに `SET` を実行する必要がある。`$executeRawUnsafe` を使い、`$transaction` 内でテナントコンテキストを設定する。

```typescript
// prisma-tenant.service.ts
@Injectable()
export class TenantAwarePrismaService {
  constructor(private readonly prisma: PrismaService) {}

  async withTenant<T>(tenantId: string, fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
      return fn(tx);
    });
  }
}
```

**注意点:**

- `SET LOCAL` はトランザクション内でのみ有効（コネクション汚染を防ぐ）
- Prisma の `$transaction` 内で実行することで、同一コネクションが保証される
- スーパーユーザー（マイグレーション用）はRLSをバイパスする
- `$executeRawUnsafe` のtenantIdは必ずUUID形式をバリデーションすること（SQLインジェクション防止）

**マイグレーション手順（実装時）:**

1. `app_user` ロールを作成し、アプリ接続をこのロールに変更
2. テナントIDを持つ全テーブルにRLSを有効化
3. `tenant_isolation` ポリシーを各テーブルに作成
4. `TenantAwarePrismaService` を実装
5. 既存の `TenantInterceptor` は残す（多層防御）
6. E2Eテストでテナント越境アクセスが拒否されることを検証

## 移行パス

1. **Phase 1（現在）**: slug手入力 + アプリ層フィルタ
2. **Phase 2**: RLS追加（アプリ層 + DB層の多層防御）
3. **Phase 3**: サブドメイン導入（UX改善）

Phase 2と3は独立して実施可能。RLSを先に入れる方がセキュリティ上の優先度が高い。

## リスクと対策

| リスク                          | 対策                                             |
| ------------------------------- | ------------------------------------------------ |
| Prisma + RLS のコネクション管理 | `SET LOCAL` + `$transaction` で汚染防止          |
| ワイルドカードSSL               | Vercelがネイティブ対応                           |
| ローカル開発の複雑化            | `*.localhost` で対応                             |
| RLS設定漏れ                     | マイグレーションスクリプトで全テーブルに自動適用 |
| SQLインジェクション             | tenantIdのUUIDバリデーション必須                 |
