# コンテキストマップ

ファイルパスに応じて、作業前に関連ドキュメントを読むこと。

## apps/api/
- docs/adr/001-tech-stack.md (NestJS選定理由)
- docs/adr/004-multi-tenancy.md (テナント分離)
- docs/spec/001-system-architecture.md (モジュール構成)

## apps/api/src/modules/auth/
- docs/adr/003-authentication.md (認証方式)
- docs/adr/009-simplified-auth.md (簡易ログイン設計)

## apps/api/src/modules/line/ or **/line*
- docs/adr/005-line-integration.md
- docs/spec/004-line-integration.md

## apps/web/
- docs/adr/006-ui-components.md (UIコンポーネント選定)
- docs/spec/003-ui-spec.md (画面仕様)
- docs/design-system/design-system.md (デザインシステム)

## packages/db/
- docs/spec/002-data-model.md (データモデル)
- docs/adr/004-multi-tenancy.md (tenantIdフィルタ)
- docs/adr/008-subdomain-tenant-and-rls.md (RLS設計)

## テナント関連の変更
- docs/adr/004-multi-tenancy.md
- docs/adr/008-subdomain-tenant-and-rls.md

## package.json, .github/workflows/, scripts/
- AGENTS.md (ブランチ戦略、コマンドインデックス)
- docs/adr/007-local-dev-setup.md (環境セットアップ)

## .env.example, .env.* 関連
- scripts/setup-env.sh が .env 自動生成
- `pnpm setup` で初期セットアップ完了
- `pnpm dev` の前に自動実行

## CI/CD 変更時
- .github/workflows/lint-and-format.yml
- .github/workflows/typecheck.yml (新規)
- .github/workflows/test.yml (新規)
- .github/workflows/build.yml (新規)
- AGENTS.md (テスト/型チェック要件)
