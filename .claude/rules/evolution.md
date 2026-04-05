# ルール進化フレームワーク

セッション `ddcd1d24-d530-4605-b7fa-12765ee5d838` で確立された、ルール自動化の6レベル。

## システムの目的

技術的な「how to code」ではなく、**「how to work」** を自動化する。
時間とともにワークフローが洗練されるよう、発見したパターンを段階的に組織化する。

## 6レベルの進化パイプライン

### Level 1: Issue駆動開発
**コマンド:** `/work-on-issue`, `/triage-issue`

- Issue URL を与えると、自動的に context 読み込み → branch 作成 → 作業開始
- `triage-issue` で Issue を分類・優先度付け
- **学習対象:** Issue からパターンを認識したら Level 3 へ

### Level 2: 自己進化するルール（Stop Hook）

- セッション終了時に自動実行
- **踏んだ地雷、発見したパターン、効果的だったアプローチ** を rules に反映
- このファイル自体が進化のプロセスを記録

### Level 3: PRレビュー学習
**コマンド:** `/learn-from-review`

- PR レビュー指摘を自動解析
- 「このエラーは次から防げる」→ ルール化
- GitHub API で PR comments 抽出 → ルール候補を提案

### Level 4: 定期監査エージェント
**コマンド:** `/audit-deps`, `/audit-code`

- `audit-deps`: 脆弱性チェック（npm audit）
- `audit-code`: コード品質監査
- 問題パターンを ルール に追加
- 例：「循環参照が発生しやすい」→ testing.md に追記

### Level 5: 設計検証（/grill-me）
**コマンド:** `/grill-me`

- 計画・設計ドキュメントを作成したら、本実装前に `/grill-me` で徹底的に質問
- 曖昧さ・矛盾・依存関係を顕在化させる
- セッション ddcd1d24 で導入：設計段階で地雷を踏むことを最小化
- パターン：spec 作成 → grill-me → plan 作成 → subagent 実行

### Level 5.5: コンテキスト自動装填
**ファイル:** `context-map.md`

- ファイルパス → 関連 ADR / Spec の自動マッピング
- 作業開始時に「何を読むべきか」を明確化
- パターン：「X の変更には常に Y ドキュメントを読む」

### Level 6: 品質ゲート
**コマンド:** `/quality-gate`

- マージ前の総合チェック
- テスト + Lint + Type Check + Security Audit + テナント分離検証
- 「なぜこの check が必要か」を rules に反映

## ルール追記の合図

### 踏んだ地雷
- エラーが同じパターンで発生した
- テナント分離バグ、循環参照、型安全性の問題
- → `api.md`, `prisma.md`, `testing.md` に追記

### 発見したパターン
- 「このコードベースではいつも X をやっている」
- 「Y ファイルを変更するときは Z を忘れずに」
- → `context-map.md` に追記、または新ルールファイル作成

### 効果的だったアプローチ
- 「この順序で作業すると効率が良い」
- 「このコマンドは必ず実行する」
- → `.claude/commands` に自動化、または `web.md` / `api.md` に best practice 化

## セッション終了時の判断フロー

1. **踏んだ地雷があったか？** → rules/\*.md に追記
2. **新しいパターンを発見したか？** → context-map.md または evolution.md に追記
3. **効果的だったアプローチか？** → /commands に自動化 or best practice として rules に記録
4. 変更がなければコミット不要

## 実装例

### セッション ddcd1d24-d530-4605-b7fa-12765ee5d838: oxlint/oxfmt 導入設計

**学習:**
- 設計段階で曖昧さが残ると実装で迷う
- `/grill-me` で質問を投げかけることで共通理解が確保できる

**成果:**
- spec + plan を順序立てて作成
- `/grill-me` コマンドを新規作成（`/.claude/commands/grill-me.md`）
- lefthook 選択、ESLint補完設定など詳細決定

**ルール化:**
- Level 5 として `/grill-me` フロー を evolution.md に追記

## 発見したパターン（セッション後盤での検証フロー確立）

### パターン：ユーザーヒアリング → Issue自動化

**発見:** 新機能開発とバグ報告を効率化する対話型プロセス

**効果的なアプローチ:**

1. **`/qa` コマンド** — バグ報告を対話的に聞き取り、自動Issue化
   - ユーザーの言葉で問題説明を取得（質問は最大2〜3個）
   - バックグラウンドでコードベース調査（Exploreエージェント）
   - 単一Issue か複数分割かの判定を自動実行
   - ドメイン用語で Issue を作成（実装詳細は含めない）

2. **`/write-prd` コマンド** — 新機能開発の完全一気通貫化
   - インタビュー → 共通理解までの深掘り
   - モジュール設計で「深いモジュール」を抽出（テスト可能性重視）
   - PRD 作成 → GitHub Issue 登録を自動実行
   - パターン：新機能 → `/write-prd` → Issue → `/work-on-issue`

**学習:**
- 結合が松、実装が細かい → 大きな粒度の「一気通貫コマンド」が有効
- ユーザー視点と開発者視点を分離：Issue に ファイルパス・行番号を含めない
- モジュール設計を先行：実装の迷い、テスト難を事前に防ぐ

**ルール化:**
- Level 3 (QA自動化) を evolution.md に追加
- `.claude/commands/qa.md` と `.claude/commands/write-prd.md` を新規作成
- AGENTS.md にコマンド登録

## インフラストラクチャレベルの地雷（セッション ddcd1d24 終盤での発見）

### 踏んだ地雷：ハーネス充実 ≠ アプリ基盤

**症状:** Claudeの行動制御（hooks, rules, commands）は整備されたが、実際の開発を回すための基盤に穴がある。

**例:**
- `pnpm test` が動かない → `/check` コマンドが実質機能しない
- `typecheck` スクリプトが未定義 → 型チェック漏れが多発
- `.env` 自動生成がない → 新メンバーが `pnpm dev` で詰まる
- ブランチ戦略が明示されない → サブエージェントが main に直接コミット

**対策:**
- Level 2 (Stop Hook) が自動更新するのと同じレベルの重要度で、**インフラタスク（CI, テスト, .env）を定期的に audit する**
- 新しいセッションで「基盤が壊れていないか」を `/audit-infra` で確認
- ブランチ戦略を AGENTS.md に明示（docs/.claude/ だけが main 直接コミット OK）

### パターン：設計レビュー → 実装 → インフラ検証

実装完了後、以下を順に実行：
1. `/grill-me` で設計を検証
2. 実装
3. `/quality-gate` + `/audit-infra` で基盤チェック
4. 新しい地雷を発見したら rules に記録

## 記録例

### パターン
```
## X モジュールのテナント分離テスト

TenantInterceptor テストが頻繁に失敗する場合は、
必ず following を確認：
- RLS ポリシーが正しい
- fixture で tenantId を正しく設定
- @UseGuards(TenantGuard) が付与されている
```

### アプローチ
```
デプロイ前チェックリスト（Level 6）
1. /audit-deps → 脆弱性 0
2. /audit-code → カバレッジ >= 80%
3. /quality-gate → 全項目グリーン
```

### インフラチェックリスト（新規）
```
## セッション終了時のインフラ確認

1. **test 基盤**: `pnpm test` が全 packages で動く
2. **typecheck**: `pnpm typecheck` で 0 errors
3. **.env**: `.env.example` → `.env` が自動生成される
4. **CI**: lint-and-format, typecheck, test, build が全て成功
5. **ブランチ戦略**: AGENTS.md に記載、コード変更は feature branch 経由
6. **QA**: `/qa` コマンドでバグ報告 → Issue 自動作成が回る

この6項目が「定常運用できる」と初めて言える。
```
