# テスト方針

## TDD（テスト駆動開発）フロー

このプロジェクトは **RED→GREEN→REFACTOR** 循環でのテスト駆動開発を推奨します。
詳細は `/tdd` コマンド（`.claude/commands/tdd.md`）を参照。

**要点:**

- RED: テストを書く（失敗する）
- GREEN: 最小限のコードで通す
- REFACTOR: テストが通った後に整理

**垂直スライス（正）vs 水平スライス（誤）:**

```
NG: 全テストを書いてから全実装を書く
OK: テスト1→実装1→テスト2→実装2
```

## テストの良さの定義

### ✅ 良いテスト（振る舞いテスト）

- 公開インターフェース経由で動作を検証
- 実装詳細に依存しない
- リファクタリング後も壊れない
- 「何ができるか」を表現（仕様書のように読める）

例：

```typescript
test("有効なカートでチェックアウトできる", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart);
  expect(result.status).toBe("confirmed");
});
```

### ❌ 悪いテスト（実装詳細テスト）

- プライベートメソッドをテスト
- 内部 mock に依存（paymentService.process の呼び出し検証など）
- コード変更ですぐ壊れる
- 「どうやるか」を検証（実装に密結合）

例（避けるべき）：

```typescript
// BAD: 実装詳細に依存
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart);
  expect(mockPayment.process).toHaveBeenCalled();
});
```

## テストカテゴリ

### Unit テスト

- Service 層のビジネスロジック（必須）
- テスト対象：公開メソッドの入出力
- 外部依存は**システム境界でのみ** mock（外部API、時刻など）
- DB は実テストDBを使用するか、PrismaService を mock
- ファイル: `*.spec.ts` に co-locate

### Integration テスト

- Controller + Service + DB の結合
- テスト用 Docker PostgreSQL を使用
- HTTP リクエスト → レスポンス の検証
- ファイル: `*.integration-spec.ts`

### E2E テスト

- API エンドポイントの主要フロー
- supertest 経由で HTTP リクエスト
- ユーザーが実際に使うシナリオ
- ファイル: `apps/api/test/*.e2e-spec.ts`

## モック戦略

**システム境界でのみモック:**

- 外部 API（LINE, 決済 API など）
- 時刻（固定化が必要な場合）
- 乱数（再現性が必要な場合）

**モックしない:**

- 自分のクラス / モジュール内部のコラボレータ
- データベース（テストDBが用意されていれば）
- 自分がコントロール下にあるもの

**原則:** mock は最小限。本物を使えるなら使う。
