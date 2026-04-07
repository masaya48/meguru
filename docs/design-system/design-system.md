# めぐる デザインシステム

## UIコンポーネント基盤

[shadcn/ui](https://ui.shadcn.com/) を使用。Tailwind CSS + Radix UI ベース。

```bash
pnpm dlx shadcn@latest init --preset b2D30ZsUV --template next --monorepo
```

shadcn/uiのコンポーネントをベースに、住民向け（大きめ）・管理者向け（標準）のバリアントを定義する。

## ロゴ

- ファイル: `logo.svg`
- 回覧の循環を表す3本の弧（ダークグリーン・ミディアムグリーン・コーラル）
- フォント: Palatino Linotype（ロゴタイプ）
- タグライン: 「地域をつなぐ、情報がめぐる」
- 最小サイズ: 幅120px
- ロゴ周囲に最低ロゴ高さの25%のクリアスペースを確保

---

## カラーパレット

ロゴから抽出した3色をベースに、UIに必要な拡張パレットを定義する。

### ブランドカラー

| 名前                | Hex     | Tailwind Token | 用途                               |
| ------------------- | ------- | -------------- | ---------------------------------- |
| Green 800 (Primary) | #2D6A4F | `green-800`    | メインカラー、ナビ、ボタン、リンク |
| Green 500           | #52B788 | `green-500`    | セカンダリ、ホバー、アクティブ状態 |
| Green 300           | #95D5B2 | `green-300`    | 薄い背景、バッジ                   |
| Green 100           | #D8F3DC | `green-100`    | 非常に薄い背景                     |
| Green 50            | #F0FFF4 | `green-50`     | カード背景（既読など）             |
| Coral 500 (Accent)  | #E76F51 | `coral-500`    | アクセント、注意喚起、未読バッジ   |
| Coral 400           | #F09E7A | `coral-400`    | ホバー                             |
| Coral 100           | #FDE8DF | `coral-100`    | 未読背景                           |

### セマンティックカラー

| 名前              | Hex     | Tailwind Token   | 用途                       |
| ----------------- | ------- | ---------------- | -------------------------- |
| Text Primary      | #1A1A2E | `text-primary`   | 見出し、本文               |
| Text Secondary    | #6B7280 | `text-secondary` | 補足テキスト、日付         |
| Text Muted        | #9CA3AF | `text-muted`     | プレースホルダー、無効状態 |
| Background        | #FFFFFF | `bg-white`       | ページ背景                 |
| Background Subtle | #F9FAFB | `bg-subtle`      | セクション背景             |
| Background Muted  | #F3F4F6 | `bg-muted`       | 既読カード、無効エリア     |
| Border            | #E5E7EB | `border-default` | カード・入力のボーダー     |
| Border Light      | #F3F4F6 | `border-light`   | セパレータ                 |

### ステータスカラー

| 名前          | Hex     | Tailwind Token         | 用途                     |
| ------------- | ------- | ---------------------- | ------------------------ |
| Success       | #16A34A | `status-success`       | 参加する、完了、既読     |
| Success Light | #DCFCE7 | `status-success-light` | 成功背景                 |
| Danger        | #DC2626 | `status-danger`        | 不参加、エラー、削除     |
| Danger Light  | #FEE2E2 | `status-danger-light`  | エラー背景               |
| Warning       | #F59E0B | `status-warning`       | 期限間近                 |
| Warning Light | #FEF3C7 | `status-warning-light` | 警告背景                 |
| Info          | #2D6A4F | `status-info`          | 情報（プライマリと同色） |
| Info Light    | #D8F3DC | `status-info-light`    | 情報背景                 |

---

## Tailwind CSS 設定

```js
// tailwind.config.ts に追加する extend 設定
{
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#F0FFF4',
          100: '#D8F3DC',
          200: '#B7E4C7',
          300: '#95D5B2',
          400: '#74C69D',
          500: '#52B788',
          600: '#40916C',
          700: '#368F5E',
          800: '#2D6A4F',
          900: '#1B4332',
        },
        coral: {
          50:  '#FFF5F2',
          100: '#FDE8DF',
          200: '#F9C9B6',
          300: '#F5A98C',
          400: '#F09E7A',
          500: '#E76F51',
          600: '#D4533B',
          700: '#B83E28',
          800: '#9C3320',
          900: '#7A2818',
        },
        ink: {
          DEFAULT: '#1A1A2E',
          light:   '#6B7280',
          muted:   '#9CA3AF',
        },
      },
      fontFamily: {
        logo: ['"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
        sans: ['"Hiragino Sans"', '"Yu Gothic"', 'Meiryo', '"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
}
```

---

## タイポグラフィ

### フォントファミリー

| 用途     | フォント                                          | Tailwind    |
| -------- | ------------------------------------------------- | ----------- |
| ロゴ     | Palatino Linotype                                 | `font-logo` |
| 本文・UI | Hiragino Sans → Yu Gothic → Meiryo → Noto Sans JP | `font-sans` |

### フォントサイズ（住民向け）

高齢者向けに標準より大きめのサイズを使用する。

| 用途           | サイズ | 行間 | Tailwind                     |
| -------------- | ------ | ---- | ---------------------------- |
| ページタイトル | 24px   | 1.3  | `text-2xl leading-tight`     |
| カードタイトル | 20px   | 1.4  | `text-xl leading-snug`       |
| 本文           | 18px   | 1.8  | `text-lg leading-relaxed`    |
| 補足テキスト   | 15px   | 1.5  | `text-[15px] leading-normal` |
| ラベル・日付   | 13px   | 1.4  | `text-sm leading-snug`       |

### フォントサイズ（管理者向け）

| 用途             | サイズ | Tailwind              |
| ---------------- | ------ | --------------------- |
| ページタイトル   | 20px   | `text-xl`             |
| セクション見出し | 16px   | `text-base font-bold` |
| テーブル本文     | 14px   | `text-sm`             |
| テーブルヘッダー | 12px   | `text-xs`             |

---

## スペーシング

Tailwindのデフォルトスケール（4px単位）を使用。住民向けはゆったり、管理者向けはコンパクトに。

| 用途               | 住民向け           | 管理者向け         |
| ------------------ | ------------------ | ------------------ |
| ページパディング   | `p-5` (20px)       | `p-5` (20px)       |
| カード内パディング | `p-5` (20px)       | `p-4` (16px)       |
| カード間マージン   | `space-y-4` (16px) | `space-y-3` (12px) |
| セクション間       | `space-y-6` (24px) | `space-y-5` (20px) |
| ボタン内パディング | `px-6 py-4`        | `px-4 py-2`        |

---

## コンポーネント

shadcn/uiをベースに、以下のカスタマイズを適用する。

### Button（shadcn/ui拡張）

shadcn/uiの `Button` に `size="resident"` バリアントを追加。

```
variant:
  default:     bg-brand-800 text-white hover:bg-brand-700    (= Primary)
  secondary:   bg-brand-100 text-brand-800 hover:bg-brand-200
  accent:      bg-coral-500 text-white hover:bg-coral-600
  destructive: bg-status-danger text-white hover:bg-red-700
  ghost:       text-brand-800 hover:bg-brand-50
  outline:     border border-default text-brand-800 hover:bg-brand-50

size:
  default:     rounded-lg px-4 py-2 text-sm font-medium min-h-[36px]  (管理者向け)
  resident:    rounded-xl px-6 py-4 text-lg font-bold min-h-[56px]    (住民向け)
  sm:          rounded-md px-3 py-1.5 text-xs
  icon:        rounded-md h-9 w-9
```

### Card（shadcn/ui拡張）

shadcn/uiの `Card` に状態バリアントを追加。

```
variant:
  default:     bg-white rounded-xl border border-default shadow-sm
  unread:      bg-coral-100 rounded-xl border-l-4 border-l-coral-500
  read:        bg-bg-muted rounded-xl
  admin:       bg-white rounded-lg shadow-sm
```

### Badge（shadcn/ui拡張）

```
variant:
  notice:      bg-brand-100 text-brand-800
  attendance:  bg-coral-100 text-coral-500
  survey:      bg-amber-100 text-amber-700
  published:   bg-status-success-light text-green-700
  draft:       bg-gray-100 text-gray-600
  closed:      bg-gray-100 text-gray-500
```

### 回答ボタン（カスタムコンポーネント）

shadcn/ui Buttonベースの `AnswerButton` コンポーネント。

```
参加する:    variant="success" size="resident"
             bg-status-success text-white rounded-xl px-8 py-5 text-xl font-bold
             → ⭕ アイコン付き
不参加:      variant="destructive" size="resident"
             bg-status-danger text-white rounded-xl px-8 py-5 text-xl font-bold
             → ❌ アイコン付き
横並び:      flex gap-3, 各ボタン flex-1
```

### shadcn/uiコンポーネント利用一覧

| コンポーネント | 用途                       |
| -------------- | -------------------------- |
| Button         | 全ボタン                   |
| Card           | 回覧カード、サマリーカード |
| Badge          | 種類・状態バッジ           |
| Table          | 管理者テーブル             |
| Dialog         | 確認ダイアログ             |
| Input          | テキスト入力               |
| Textarea       | 本文入力                   |
| Select         | 配信先・種類選択           |
| Tabs           | 管理者画面内の切替         |
| Toast          | 操作完了通知               |
| Avatar         | ユーザーアイコン           |
| Dropdown Menu  | 管理者のアクションメニュー |
| Sheet          | モバイルのサイドバー       |
| Skeleton       | ローディング状態           |

### ナビゲーション（カスタムコンポーネント）

```
管理者サイドバー:
  背景:      bg-ink
  幅:        w-52 (208px)
  メニュー項目: px-3 py-2.5 rounded-md text-sm
  アクティブ:  bg-brand-800 text-white
  非アクティブ: text-gray-400 hover:text-white hover:bg-white/10
  モバイル:   shadcn/ui Sheet で表示

住民向けヘッダー:
  背景:      bg-brand-800
  テキスト:   text-white text-xl font-bold text-center
  パディング: py-4
```

### 入力フィールド（shadcn/ui Input拡張）

```
size:
  default:     border border-default rounded-md px-3 py-2 text-sm     (管理者向け)
  resident:    border border-default rounded-lg px-4 py-3 text-lg     (住民向け)
focus:         ring-2 ring-brand-500 border-brand-500
```

---

## アイコン

[Lucide Icons](https://lucide.dev/) を使用。線の太さ・サイズを統一する。

| 用途     | 住民向け                       | 管理者向け |
| -------- | ------------------------------ | ---------- |
| サイズ   | 24px                           | 18px       |
| 線の太さ | 2px                            | 1.5px      |
| 色       | `text-ink` or `text-ink-light` | 同左       |

---

## シャドウ

```
sm:   shadow-sm    — カード、ボタン
md:   shadow-md    — ドロップダウン、モーダル
lg:   shadow-lg    — トースト通知
```

---

## 角丸

| 用途   | 住民向け            | 管理者向け         |
| ------ | ------------------- | ------------------ |
| カード | `rounded-xl` (12px) | `rounded-lg` (8px) |
| ボタン | `rounded-xl` (12px) | `rounded-lg` (8px) |
| バッジ | `rounded` (4px)     | `rounded` (4px)    |
| 入力   | `rounded-lg` (8px)  | `rounded-md` (6px) |

---

## レスポンシブブレークポイント

Tailwindデフォルトを使用:

| ブレークポイント | 幅       | 用途                             |
| ---------------- | -------- | -------------------------------- |
| (default)        | 〜639px  | 住民向けモバイル                 |
| `sm`             | 640px〜  | —                                |
| `md`             | 768px〜  | 管理者タブレット、サイドバー切替 |
| `lg`             | 1024px〜 | 管理者デスクトップ               |
| `xl`             | 1280px〜 | ワイドスクリーン                 |
