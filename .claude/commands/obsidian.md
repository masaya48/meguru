---
name: obsidian
description: Obsidian Vault のノートを検索・作成・管理する。
---

Obsidian Vault のノートを検索・作成・管理する。

## Vault の場所

`/Users/masayafukazawa/Documents/Obsidian Vault/knowledges/`

フラット構成（フォルダではなくリンクとインデックスノートで整理）。

## 命名規則

- **インデックスノート**: 関連トピックを集約（例: `Skills Index.md`, `NestJS Index.md`）
- ノート名は **Title Case**
- フォルダで整理しない — `[[wikilinks]]` とインデックスノートを使う

## リンク

- Obsidian の `[[wikilinks]]` 記法を使用: `[[Note Title]]`
- ノートの末尾に関連ノートへのリンクを追加
- インデックスノートは `[[wikilinks]]` のリスト

## 操作

### ノートを検索

Glob/Grep ツールを Vault パスに対して使用する。

### ノートを作成

1. ファイル名は **Title Case**
2. 学びの単位として内容を書く
3. 末尾に `[[wikilinks]]` で関連ノートへのリンクを追加
4. 関連するインデックスノートがあれば、そこにもリンクを追加

### バックリンクを探す

Vault 内で `[[Note Title]]` を検索して、そのノートを参照しているノートを見つける。

### インデックスノートを探す

Vault 内で `*Index*` を含むファイル名を検索する。
