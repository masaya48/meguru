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

### Level 5: コンテキスト自動装填
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
