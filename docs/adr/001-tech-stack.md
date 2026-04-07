# ADR-001: 技術スタックの選定

## ステータス

承認済み

## コンテキスト

町内会・自治会向け回覧板SaaS「めぐる」のMVPを開発するにあたり、技術スタックを選定する必要がある。要件として:

- 高齢者向けのシンプルなWebUI（SSR対応）
- REST APIによるビジネスロジック集約
- LINE Messaging API連携
- マルチテナント対応
- 将来の拡張性

## 検討した選択肢

### A) Next.js + Supabase

- 開発速度が最速。認証・DB・ストレージが一括
- Supabaseへのロックイン。複雑なビジネスロジックはEdge Functionsで対応が必要

### B) Next.js + NestJS + PostgreSQL

- バックエンドの自由度が高い。将来の拡張に強い
- 初期開発コストはやや高い。インフラ管理が増える

### C) Remix + Firebase

- Firebaseの無料枠が大きい。プッシュ通知が容易
- NoSQL（Firestore）は既読集計・アンケート回答の集計クエリがやや複雑

## 決定

**B) Next.js + NestJS + PostgreSQL** を採用する。

## 理由

- ビジネスロジック（回覧配信、既読管理、回答集計、LINE連携）が複雑であり、NestJSのモジュール構造で整理しやすい
- PostgreSQLのリレーショナルクエリは既読率・回答率の集計に適している
- Prisma ORMによる型安全なDB操作
- BaaSへのロックインを避け、将来の料金モデル導入やスケーリングに柔軟に対応できる

## 構成詳細

| レイヤー             | 技術                                |
| -------------------- | ----------------------------------- |
| フロントエンド       | Next.js (App Router) + Tailwind CSS |
| バックエンド         | NestJS + Prisma                     |
| データベース         | PostgreSQL                          |
| デプロイ（フロント） | Vercel                              |
| デプロイ（API/DB）   | Railway / Fly.io                    |
| LINE連携             | LINE Messaging API                  |
