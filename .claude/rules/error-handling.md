# エラーハンドリング規約

## API (NestJS)

- NestJS 組み込みの例外クラスを使う（NotFoundException, BadRequestException 等）
- カスタム例外は作らない。組み込みで足りる
- HttpExceptionFilter がグローバルで `{ statusCode, message, error }` 形式に統一
- Service 層でビジネスロジックのバリデーション → 例外を throw
- Controller 層では try-catch しない（フィルタに任せる）
- 外部API呼び出し（LINE等）は try-catch して InternalServerErrorException に変換

```typescript
// Good
throw new NotFoundException("Circular not found");

// Bad - カスタム例外
throw new CircularNotFoundException(id);

// Bad - Controller で catch
try { return this.service.find(id); } catch (e) { ... }
```

## Web (Next.js)

- Server Actions: try-catch して `{ error: string }` を返す。throw しない
- API呼び出し: lib/api.ts の ApiError をハンドリング
- コンポーネント: error.tsx でページ単位のエラーバウンダリ
- ユーザー向けメッセージは日本語。技術的な詳細は含めない

```typescript
// Server Action
export async function doSomething(): Promise<{ error?: string }> {
  try {
    await api("/endpoint", { method: "POST" });
    return {};
  } catch {
    return { error: "操作に失敗しました" };
  }
}
```

## 共通

- console.log でエラーを握りつぶさない
- 意味のあるエラーメッセージを返す（「エラーが発生しました」は禁止）
- 外部依存の失敗（DB, LINE API等）はログに記録する
