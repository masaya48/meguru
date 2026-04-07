// Root ESLint config — delegates to workspace-specific configs.
// oxlint is the primary linter; ESLint covers framework-specific rules only
// (Next.js: next/core-web-vitals, NestJS: @typescript-eslint).
// See ADR-002 for rationale.

export default [
  {
    ignores: [
      "node_modules/",
      "**/dist/",
      "**/.next/",
      "packages/db/src/*.js",
      "packages/db/src/*.d.ts",
    ],
  },
];
