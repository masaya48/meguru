# SPEC-001: システムアーキテクチャ

## 全体構成

```
クライアント層
  ├── Webブラウザ（住民向け / スマホ中心）
  ├── Webブラウザ（管理者向け / PC中心）
  └── LINE Bot（通知 + 簡易回答）

フロントエンド層: Next.js (Vercel)
  ├── SSRページ配信（住民向け）
  ├── SPAダッシュボード（管理者向け）
  ├── BFF（Backend for Frontend）
  └── LINE Webhook受信 → NestJSへ転送

バックエンド層: NestJS (Railway / Fly.io)
  ├── 認証モジュール（JWT + マジックリンク + LINE Login）
  ├── 回覧モジュール（CRUD / 配信 / テンプレート）
  ├── 既読・回答モジュール（記録 / 集計）
  ├── テナントモジュール（マルチテナント管理）
  ├── ユーザーモジュール（招待 / 申請 / グループ）
  ├── LINE連携モジュール（Messaging API / Postback処理）
  └── 通知モジュール（LINE送信 / リマインド）

データ層: PostgreSQL (Railway)
  └── Prisma ORM（テナントIDフィルタ自動適用）
```

## API設計方針

- RESTful API（NestJS）
- 認証: JWT Bearer Token
- テナント識別: JWTペイロードに `tenantId` を含める
- レスポンス形式: JSON
- エラー形式: `{ statusCode, message, error }`

## NestJS モジュール構成

```
src/
├── app.module.ts
├── common/
│   ├── guards/           # AuthGuard, RolesGuard, TenantGuard
│   ├── decorators/       # @CurrentUser, @Roles, @Public
│   ├── interceptors/     # TenantInterceptor
│   └── filters/          # HttpExceptionFilter
├── modules/
│   ├── auth/             # 認証（マジックリンク, LINE Login, パスワード）
│   ├── tenant/           # テナントCRUD
│   ├── user/             # ユーザー管理・招待・申請
│   ├── group/            # グループ（班・組）管理
│   ├── circular/         # 回覧CRUD・配信
│   ├── read/             # 既読記録
│   ├── question/         # 質問管理
│   ├── answer/           # 回答記録・集計
│   ├── template/         # テンプレート管理
│   ├── line/             # LINE連携（Webhook, メッセージ送信）
│   └── notification/     # 通知管理・リマインド
└── prisma/
    └── prisma.service.ts # Prismaクライアント（テナントフィルタミドルウェア）
```

## Next.js ルーティング

```
app/
├── (resident)/               # 住民向け（レイアウト共通）
│   ├── page.tsx              # 回覧一覧（カード型リスト）
│   ├── circular/
│   │   └── [id]/
│   │       └── page.tsx      # 回覧詳細 + 回答
│   ├── settings/
│   │   └── page.tsx          # LINE連携・プロフィール設定
│   └── layout.tsx
├── (admin)/                  # 管理者向け（サイドバーレイアウト）
│   ├── dashboard/
│   │   └── page.tsx          # ダッシュボード
│   ├── circulars/
│   │   ├── page.tsx          # 回覧一覧テーブル
│   │   ├── new/
│   │   │   └── page.tsx      # 回覧作成
│   │   └── [id]/
│   │       ├── page.tsx      # 回覧詳細（既読・回答状況）
│   │       └── edit/
│   │           └── page.tsx  # 回覧編集
│   ├── members/
│   │   └── page.tsx          # 住民管理
│   ├── groups/
│   │   └── page.tsx          # グループ管理
│   ├── templates/
│   │   └── page.tsx          # テンプレート管理
│   ├── settings/
│   │   └── page.tsx          # テナント設定
│   └── layout.tsx
├── auth/
│   ├── login/
│   │   └── page.tsx          # ログイン
│   ├── verify/
│   │   └── page.tsx          # マジックリンク検証
│   └── register/
│       └── page.tsx          # 招待・申請登録
└── api/
    └── line/
        └── webhook/
            └── route.ts      # LINE Webhook受信
```
