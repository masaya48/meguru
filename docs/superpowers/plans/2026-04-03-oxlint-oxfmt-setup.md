# oxlint + oxfmt + lefthook 導入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** モノレポにoxlint（メインlinter）+ oxfmt（メインformatter）+ ESLint（補完）+ lefthook（pre-commit）を導入し、CI設定まで完了する。

**Architecture:** ルートにoxlint/oxfmt設定を置きモノレポ全体に適用。ESLintは各app（web/api）にNext.js/NestJS固有ルールのみ最小限で設定。lefthookでpre-commitフック、GitHub ActionsでCIチェック。

**Tech Stack:** oxlint, oxfmt (oxc), ESLint, lefthook, pnpm workspace, GitHub Actions

**前提:** プロジェクトにはまだpackage.jsonがないため、Task 1でルートpackage.jsonとpnpm-workspace.yamlを作成する。

---

## File Structure

```
meguru/
├── package.json                          # ルートworkspace設定 + devDependencies + scripts
├── pnpm-workspace.yaml                   # pnpm workspace定義
├── oxlintrc.json                         # oxlint設定
├── lefthook.yml                          # pre-commitフック設定
├── .github/
│   └── workflows/
│       └── lint.yml                      # CI lint/format チェック
├── apps/
│   ├── web/
│   │   ├── package.json                  # Next.js app
│   │   └── eslint.config.mjs            # Next.js固有ESLintルール
│   └── api/
│       ├── package.json                  # NestJS app
│       └── eslint.config.mjs            # NestJS固有ESLintルール
└── packages/
    ├── shared/
    │   └── package.json
    └── db/
        └── package.json
```

---

### Task 1: ルートpackage.json と pnpm-workspace.yaml の作成

**Files:**

- Create: `package.json`
- Create: `pnpm-workspace.yaml`

- [ ] **Step 1: ルートpackage.jsonを作成**

```json
{
  "name": "meguru",
  "private": true,
  "packageManager": "pnpm@10.8.0",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "lint": "oxlint . && pnpm -r --if-present run lint:eslint",
    "lint:fix": "oxlint --fix . && pnpm -r --if-present run lint:eslint:fix",
    "format": "oxfmt .",
    "format:check": "oxfmt --check .",
    "prepare": "lefthook install"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: pnpm-workspace.yamlを作成**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: 各workspace用の最小package.jsonを作成**

`apps/web/package.json`:

```json
{
  "name": "@meguru/web",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "lint:eslint": "eslint .",
    "lint:eslint:fix": "eslint --fix ."
  }
}
```

`apps/api/package.json`:

```json
{
  "name": "@meguru/api",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "lint:eslint": "eslint .",
    "lint:eslint:fix": "eslint --fix ."
  }
}
```

`packages/shared/package.json`:

```json
{
  "name": "@meguru/shared",
  "private": true,
  "version": "0.0.0"
}
```

`packages/db/package.json`:

```json
{
  "name": "@meguru/db",
  "private": true,
  "version": "0.0.0"
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-workspace.yaml apps/ packages/
git commit -m "chore: initialize pnpm workspace structure"
```

---

### Task 2: oxlint + oxfmt のインストールと設定

**Files:**

- Modify: `package.json` (devDependencies追加)
- Create: `oxlintrc.json`

- [ ] **Step 1: oxlint と oxfmt をインストール**

```bash
pnpm add -Dw oxlint
```

oxfmtについて: oxfmtがnpmで公開されていない場合は `@oxc/oxfmt` または oxc CLI経由で導入する。以下で確認:

```bash
pnpm search oxfmt
```

公開されていれば:

```bash
pnpm add -Dw oxfmt
```

未公開の場合は、oxfmtのGitHubリリースからバイナリを取得するか、利用可能になるまでスキップしてPrettierで代替する。

- [ ] **Step 2: oxlintrc.jsonを作成**

```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "eqeqeq": "error"
  },
  "ignorePatterns": ["node_modules", "dist", ".next", "coverage"]
}
```

- [ ] **Step 3: 動作確認用のテストファイルを作成**

`apps/web/src/index.ts`:

```typescript
const unused = "this should trigger no-unused-vars";

export function hello(): string {
  return "hello";
}
```

- [ ] **Step 4: oxlintの動作確認**

```bash
pnpm oxlint .
```

Expected: `unused` 変数に対する warning が表示される。

- [ ] **Step 5: oxfmtの動作確認（インストール済みの場合）**

```bash
pnpm oxfmt --check .
```

Expected: フォーマットの差分があれば非ゼロ終了。

```bash
pnpm oxfmt .
```

Expected: ファイルがフォーマットされる。

- [ ] **Step 6: テストファイルを削除**

```bash
rm apps/web/src/index.ts
rmdir apps/web/src
```

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml oxlintrc.json
git commit -m "chore: add oxlint and oxfmt with base configuration"
```

---

### Task 3: ESLint 補完設定（apps/web + apps/api）

**Files:**

- Modify: `package.json` (devDependencies追加)
- Modify: `apps/web/package.json` (devDependencies追加)
- Modify: `apps/api/package.json` (devDependencies追加)
- Create: `apps/web/eslint.config.mjs`
- Create: `apps/api/eslint.config.mjs`

- [ ] **Step 1: ESLint関連パッケージをインストール**

```bash
pnpm add -Dw eslint typescript
pnpm add -D --filter @meguru/web eslint-config-next @eslint/js
pnpm add -D --filter @meguru/api @typescript-eslint/eslint-plugin @typescript-eslint/parser @eslint/js
```

- [ ] **Step 2: apps/web/eslint.config.mjsを作成**

Next.js固有ルールのみ。oxlintがカバーするルールは含めない。

```javascript
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // oxlintがカバーするルールをoff
      "no-unused-vars": "off",
      "no-console": "off",
      eqeqeq: "off",
    },
  },
];
```

- [ ] **Step 3: apps/api/eslint.config.mjsを作成**

NestJS固有ルール（デコレータ関連）のみ。

```javascript
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // oxlintがカバーするルールをoff
      "no-unused-vars": "off",
      "no-console": "off",
      eqeqeq: "off",

      // NestJS/TypeScript固有
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
    },
  },
];
```

- [ ] **Step 4: ESLint動作確認**

```bash
pnpm -r --if-present run lint:eslint
```

Expected: エラーなし（ソースファイルがまだないため）。

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml apps/web/eslint.config.mjs apps/web/package.json apps/api/eslint.config.mjs apps/api/package.json
git commit -m "chore: add ESLint with Next.js and NestJS specific rules"
```

---

### Task 4: lefthook の導入

**Files:**

- Modify: `package.json` (devDependencies追加)
- Create: `lefthook.yml`

- [ ] **Step 1: lefthookをインストール**

```bash
pnpm add -Dw lefthook
```

- [ ] **Step 2: lefthook.ymlを作成**

```yaml
pre-commit:
  parallel: true
  commands:
    format:
      glob: "*.{ts,tsx,js,jsx}"
      run: pnpm oxfmt {staged_files}
      stage_fixed: true
    oxlint:
      glob: "*.{ts,tsx,js,jsx}"
      run: pnpm oxlint --fix {staged_files}
      stage_fixed: true
    eslint:
      glob: "*.{ts,tsx,js,jsx}"
      run: pnpm eslint --fix {staged_files}
      stage_fixed: true
```

- [ ] **Step 3: lefthookをインストール（gitフック登録）**

```bash
pnpm lefthook install
```

Expected: `.git/hooks/pre-commit` が作成される。

- [ ] **Step 4: 動作確認**

テスト用ファイルを作成してコミットを試みる:

```bash
mkdir -p apps/web/src
echo 'const unused = "test";' > apps/web/src/test.ts
git add apps/web/src/test.ts
git commit -m "test: verify lefthook"
```

Expected: pre-commitフックが発火し、oxlint/oxfmt/eslintが実行される。

```bash
rm apps/web/src/test.ts
rmdir apps/web/src
```

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml lefthook.yml
git commit -m "chore: add lefthook for pre-commit linting and formatting"
```

---

### Task 5: GitHub Actions CI 設定

**Files:**

- Create: `.github/workflows/lint.yml`

- [ ] **Step 1: .github/workflows/lint.ymlを作成**

```yaml
name: Lint & Format

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Check formatting
        run: pnpm format:check

      - name: Run oxlint
        run: pnpm oxlint .

      - name: Run ESLint
        run: pnpm -r --if-present run lint:eslint
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/lint.yml
git commit -m "ci: add lint and format check workflow"
```

---

### Task 6: ADR更新

**Files:**

- Modify: `docs/adr/002-monorepo-and-tooling.md`

- [ ] **Step 1: ADR-002にlint/format方針を追記**

`docs/adr/002-monorepo-and-tooling.md` の末尾に以下を追加:

```markdown
## Lint・Format

- **oxlint** をメインlinterとして採用（高速、ESLintと互換性のあるルール）
- **oxfmt** をメインformatterとして採用（Prettier不要）
- **ESLint** はNext.js固有ルール（next/core-web-vitals）とNestJS固有ルール（@typescript-eslint）の補完のみ
- **lefthook** でpre-commitフック（format → oxlint → eslint）
- **GitHub Actions** でPRおよびmainブランチへのpush時にlint/formatチェック
```

- [ ] **Step 2: Commit**

```bash
git add docs/adr/002-monorepo-and-tooling.md
git commit -m "docs: add lint/format tooling decisions to ADR-002"
```
