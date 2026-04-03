# ADR-002: モノレポ構成とバージョン管理

## ステータス

承認済み

## コンテキスト

フロントエンド（Next.js）とバックエンド（NestJS）を同一リポジトリで管理する必要がある。共通の型定義やPrismaスキーマを複数パッケージで共有したい。

## 決定

- **pnpm workspace** でモノレポ構成を採用
- **asdf** でNode.js等のランタイムバージョンを管理

## ディレクトリ構成

```
meguru/
├── .tool-versions              # asdf (node, pnpm)
├── pnpm-workspace.yaml
├── package.json                # ワークスペースルート
├── apps/
│   ├── web/                    # Next.js (住民向け + 管理者向け)
│   └── api/                    # NestJS
├── packages/
│   ├── shared/                 # 共通型定義・ユーティリティ
│   └── db/                     # Prisma スキーマ + クライアント
└── docs/
    ├── prd/
    ├── adr/
    └── spec/
```

## 理由

- pnpm workspaceは高速でディスク効率が良い
- 共通パッケージ（shared, db）をフロント・バックエンドから参照可能
- asdfでチーム全体のNode.jsバージョンを統一
- モノレポにより、型定義の変更がフロント・バックエンド双方に即座に反映される
