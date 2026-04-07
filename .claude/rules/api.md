# NestJS API 規約 (apps/api)

- モジュール単位で機能分割（auth, tenant, user, circular, group）
- 1モジュール = module + controller + service + dto/
- Guard/Decorator/Interceptor は common/ に配置
- テナント分離: TenantInterceptor で全クエリに tenantId を自動付与
- 認証: JWT Bearer Token。@Public() で公開エンドポイント指定
- DTO は class-validator + class-transformer でバリデーション
- エラーレスポンス: `{ statusCode, message, error }` 形式
- テストは \*.spec.ts に co-locate。Service のユニットテストを必須とする
