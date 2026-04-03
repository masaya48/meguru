# oxlint + oxfmt 導入設計

## 概要

モノレポのscaffolding時に、oxlint（高速linter）+ oxfmt（高速formatter）をメインツールとして導入する。ESLintはNext.js/NestJS固有ルールの補完に限定使用する。

## ツール構成

| 役割 | メイン | 補完 |
|------|--------|------|
| Lint | oxlint | ESLint（next/core-web-vitals, NestJS推奨ルール） |
| Format | oxfmt | なし（Prettier不要） |

## 設定ファイル配置

```
meguru/
├── oxlintrc.json              # oxlint設定（ルート共通）
├── .oxfmtrc.json              # oxfmt設定（ルート共通）
├── lefthook.yml               # pre-commitフック
├── apps/
│   ├── web/
│   │   └── eslint.config.mjs  # Next.js固有ルールのみ
│   └── api/
│       └── eslint.config.mjs  # NestJS固有ルールのみ
```

- oxlint/oxfmtはルートに1つ、モノレポ全体に適用
- ESLintは各appに最小限の設定（oxlintと重複するルールはoff）

## ルートpackage.jsonのscripts

```json
{
  "scripts": {
    "lint": "oxlint . && pnpm -r run lint:eslint",
    "lint:fix": "oxlint --fix . && pnpm -r run lint:eslint:fix",
    "format": "oxfmt .",
    "format:check": "oxfmt --check ."
  }
}
```

## pre-commit（lefthook）

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    format:
      glob: "*.{ts,tsx,js,jsx}"
      run: oxfmt {staged_files}
      stage_fixed: true
    oxlint:
      glob: "*.{ts,tsx,js,jsx}"
      run: oxlint --fix {staged_files}
      stage_fixed: true
    eslint:
      glob: "*.{ts,tsx,js,jsx}"
      run: eslint --fix {staged_files}
      stage_fixed: true
```

- lefthookはGo製バイナリで高速
- `stage_fixed: true` で修正ファイルを自動再ステージ
- `parallel: true` で並列実行

## CI（GitHub Actions）

```yaml
lint-and-format:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
      with:
        node-version-file: '.tool-versions'
        cache: 'pnpm'
    - run: pnpm install --frozen-lockfile
    - run: pnpm format:check
    - run: pnpm lint
```

## 依存パッケージ（ルートdevDependencies）

- `oxlint` — メインlinter
- `oxfmt` — メインformatter（npmで未公開の場合はoxc CLIから利用）
- `eslint` — 補完lint
- `eslint-config-next` — Next.js固有ルール（apps/web用）
- `@typescript-eslint/eslint-plugin` — TypeScript固有ルール（apps/api用）
- `lefthook` — pre-commitフック

## ESLintの最小設定方針

- oxlintがカバーするルールはすべてoff
- Next.js: `next/core-web-vitals` のみ有効
- NestJS: デコレータ関連など、oxlintが未対応のルールのみ有効
