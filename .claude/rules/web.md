# Next.js Frontend 規約 (apps/web)

- App Router を使用。pages/ は使わない
- Server Components をデフォルトにし、"use client" は必要な箇所のみ
- データ取得は Server Components 内で fetch（BFF パターン）
- 住民向けページは SSR 必須（高齢者のスマホ対応、SEO）
- 管理者向けダッシュボードは SPA 的に構成して良い
- スタイリングは Tailwind CSS。インラインスタイルは禁止
- コンポーネントは機能単位でディレクトリ分割
- アクセシビリティ: 大きめのフォント・ボタン、十分なコントラスト比
