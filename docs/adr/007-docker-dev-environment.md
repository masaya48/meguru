# ADR-007: Docker Compose による開発環境統一

## ステータス

承認済み

## コンテキスト

開発者ごとにPostgreSQLのバージョンやポートが異なり、環境構築の手間とバグの原因になっていた。

## 決定

Docker Composeで開発用のPostgreSQLとMailHogを提供する。

## 構成

| サービス | イメージ | ポート | 用途 |
|---------|---------|--------|------|
| db | postgres:16-alpine | 5432 | メインDB |
| mailhog | mailhog/mailhog | 1025 (SMTP), 8025 (Web UI) | 開発用メール確認 |

## 使い方

```bash
docker compose up -d    # 起動
docker compose down      # 停止
docker compose down -v   # 停止 + データ削除
```

## 理由

- `docker compose up -d` 一発で開発環境が立ち上がる
- PostgreSQLのバージョン（16）とポート（5432）を統一
- MailHogでマジックリンクのメール送信を開発中に確認可能（http://localhost:8025）
- 将来的にRedis等のサービス追加が容易
