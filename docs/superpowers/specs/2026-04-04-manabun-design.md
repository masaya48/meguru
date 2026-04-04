# まなぶん — 個人教室向け運営管理SaaS 設計書

## 概要

「まなぶん」は個人教室（ピアノ・書道・学習塾・ヨガ等）の先生向け運営管理SaaS。出欠管理・振替管理・月謝管理をワンストップで提供し、AIによるレッスンレポート自動生成とLINE配信で事務作業を削減する。

めぐる（回覧板SaaS）のコードベースからピボット。インフラ層（認証・テナント分離・LINE連携・通知基盤）を流用し、ドメイン層を全入れ替えするクリーンスタート方式を採用。

### 前提・制約

- 全ての時刻は JST（Asia/Tokyo）で保存・表示。監査フィールド（createdAt, updatedAt, sentAt, paidAt）は TIMESTAMPTZ を使用
- グループレッスンは MVP スコープ外。LessonSlot は1生徒1枠の個人レッスンモデル（将来の拡張パスとして LessonSlotStudent 中間テーブルを想定）
- 削除は論理削除（deletedAt）を使用。Student, Course, LessonSlot が対象

## ターゲット

- **先生**: 個人〜小規模教室の運営者（生徒数5〜50名）。スマホ操作が中心
- **保護者**: LINEで通知を受け取る。アカウント作成不要、LINE友達追加のみ

## データモデル

### enum

```
Role: TEACHER / PARENT
UserStatus: ACTIVE / PENDING
Genre: PIANO / CALLIGRAPHY / STUDY / YOGA / SWIMMING / OTHER
DayOfWeek: MON / TUE / WED / THU / FRI / SAT / SUN
SessionStatus: SCHEDULED / COMPLETED / CANCELLED / RESCHEDULED
AttendanceStatus: PRESENT / ABSENT / LATE
ReportStatus: DRAFT / SENT
RescheduleStatus: PENDING / APPROVED / REJECTED / CANCELLED
PaymentStatus: UNPAID / PAID / OVERDUE
NotificationChannel: LINE
NotificationType: LESSON_REMINDER / REPORT / RESCHEDULE / PAYMENT_REMINDER
NotificationStatus: PENDING / SENT / FAILED
```

### モデル

**Tenant（教室）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | 教室名 |
| slug | VARCHAR(50) | URL用スラッグ（UNIQUE） |
| genre | Genre | 教室ジャンル |
| plan | VARCHAR(20) | 料金プラン（default: "free"） |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

**User（先生 / 保護者）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| name | VARCHAR(50) | |
| email | VARCHAR(255) | NULLable（保護者はメール不要の場合あり） |
| phone | VARCHAR(20) | NULLable |
| lineUserId | VARCHAR(100) | NULLable |
| passwordHash | VARCHAR(255) | NULLable（保護者はパスワード不要） |
| role | Role | TEACHER / PARENT |
| status | UserStatus | ACTIVE / PENDING |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

インデックス: `[tenantId, email]` UNIQUE, `[tenantId]`, `[lineUserId]`

**Student（生徒）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| name | VARCHAR(50) | |
| notes | TEXT | 先生用メモ（アレルギー等） |
| deletedAt | TIMESTAMP | NULLable、論理削除用 |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

インデックス: `[tenantId]`

**StudentParent（生徒↔保護者紐づけ）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| studentId | UUID | FK → Student |
| userId | UUID | FK → User（保護者） |
| createdAt | TIMESTAMP | |

インデックス: `[studentId, userId]` UNIQUE, `[tenantId]`

**Course（コース）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| name | VARCHAR(100) | 例: ピアノ初級 |
| monthlyFee | INT | 月謝額（円） |
| maxMonthlyReschedules | INT | 月間振替上限回数（default: 2） |
| deletedAt | TIMESTAMP | NULLable、論理削除用 |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

インデックス: `[tenantId]`

**StudentCourse（生徒↔コース紐づけ）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| studentId | UUID | FK → Student |
| courseId | UUID | FK → Course |
| createdAt | TIMESTAMP | |

インデックス: `[studentId, courseId]` UNIQUE, `[tenantId]`

**LessonSlot（定期レッスン枠）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| courseId | UUID | FK → Course |
| studentId | UUID | FK → Student |
| dayOfWeek | DayOfWeek | 曜日 |
| startTime | TIME | 開始時刻 |
| endTime | TIME | 終了時刻 |
| deletedAt | TIMESTAMP | NULLable、論理削除用 |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

インデックス: `[tenantId, dayOfWeek]`

**LessonSession（個別レッスン実施記録）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| lessonSlotId | UUID | FK → LessonSlot（NULLable、振替の場合NULL） |
| studentId | UUID | FK → Student |
| courseId | UUID | FK → Course |
| date | DATE | 実施日 |
| startTime | TIME | 開始時刻 |
| endTime | TIME | 終了時刻 |
| status | SessionStatus | SCHEDULED / COMPLETED / CANCELLED / RESCHEDULED |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

インデックス: `[tenantId, date]`, `[studentId, date]`

**Attendance（出欠）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| lessonSessionId | UUID | FK → LessonSession |
| studentId | UUID | FK → Student |
| tenantId | UUID | FK → Tenant |
| status | AttendanceStatus | PRESENT / ABSENT / LATE |
| note | VARCHAR(500) | NULLable、先生メモ |
| createdAt | TIMESTAMP | |

インデックス: `[lessonSessionId, studentId]` UNIQUE, `[tenantId]`

**LessonNote（レッスンメモ + AIレポート）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| lessonSessionId | UUID | FK → LessonSession |
| studentId | UUID | FK → Student |
| teacherMemo | TEXT | 先生の短いメモ |
| aiReport | TEXT | AI生成レポート（NULLable） |
| reportStatus | ReportStatus | DRAFT / SENT |
| sentAt | TIMESTAMP | NULLable |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

インデックス: `[lessonSessionId, studentId]` UNIQUE, `[tenantId]`

**MonthlySummary（月次サマリー）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| studentId | UUID | FK → Student |
| courseId | UUID | FK → Course |
| year | INT | 年 |
| month | INT | 月（1-12） |
| aiSummary | TEXT | AI生成サマリー |
| editedSummary | TEXT | 先生が編集したサマリー（NULLable） |
| reportStatus | ReportStatus | DRAFT / SENT |
| sentAt | TIMESTAMP | NULLable |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

インデックス: `[tenantId, studentId, courseId, year, month]` UNIQUE

**RescheduleRequest（振替リクエスト）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| originalSessionId | UUID | FK → LessonSession |
| requestedSessionId | UUID | FK → LessonSession（NULLable、承認後に設定） |
| studentId | UUID | FK → Student |
| requestedById | UUID | FK → User（保護者） |
| status | RescheduleStatus | PENDING / APPROVED / REJECTED / CANCELLED |
| suggestedSlots | JSON | AIサジェスト結果 |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

インデックス: `[tenantId, status]`, `[studentId]`

**Payment（月謝）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| studentId | UUID | FK → Student |
| courseId | UUID | FK → Course |
| year | INT | 年 |
| month | INT | 月（1-12） |
| amount | INT | 金額（円） |
| status | PaymentStatus | UNPAID / PAID / OVERDUE |
| paidAt | TIMESTAMP | NULLable |
| note | VARCHAR(500) | NULLable |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

インデックス: `[tenantId, year, month]`, `[studentId, courseId, year, month]` UNIQUE

**Notification（通知）**

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| tenantId | UUID | FK → Tenant |
| userId | UUID | FK → User |
| channel | NotificationChannel | LINE |
| type | NotificationType | |
| status | NotificationStatus | PENDING / SENT / FAILED |
| referenceId | UUID | 紐づくエンティティのID |
| referenceType | VARCHAR(50) | エンティティ種別（"lesson_note", "reschedule" 等） |
| sentAt | TIMESTAMP | NULLable |
| createdAt | TIMESTAMP | |

インデックス: `[tenantId, status]`, `[userId, status]`

## APIモジュール構成

```
src/
├── common/                    # 既存流用
│   ├── guards/                # AuthGuard, RolesGuard
│   ├── decorators/            # @CurrentUser, @Roles, @Public
│   ├── interceptors/          # TenantInterceptor
│   └── filters/               # HttpExceptionFilter
├── modules/
│   ├── auth/                  # 流用: magic-link + password
│   ├── tenant/                # 流用: 教室CRUD（genre追加）
│   ├── prisma/                # 流用
│   ├── mail/                  # 流用
│   ├── line/                  # 流用+拡張: 欠席連絡・振替フロー
│   ├── notification/          # 流用+拡張: 通知タイプ追加
│   ├── parent/                # 新規: 保護者管理、招待
│   ├── student/               # 新規: 生徒CRUD、保護者紐づけ、コース登録
│   ├── course/                # 新規: コースCRUD
│   ├── lesson/                # 新規: スケジュール管理、セッション生成・CRUD
│   ├── attendance/            # 新規: 出欠記録、統計
│   ├── absence/               # 新規: 保護者からの欠席連絡
│   ├── lesson-note/           # 新規: メモ + AIレポート生成
│   ├── monthly-summary/       # 新規: 月次サマリー管理
│   ├── reschedule/            # 新規: 振替リクエスト管理
│   ├── payment/               # 新規: 月謝管理
│   └── ai/                    # 新規: Claude APIクライアント
```

### 主要エンドポイント

**parent（保護者管理）**
- `POST /parents` — 保護者ユーザー作成（先生が実行）
- `GET /parents` — 保護者一覧
- `GET /students/:id/parents` — 生徒の保護者一覧
- `POST /students/:id/invite` — LINE招待リンク/QRコード生成

**student**
- `POST /students` — 生徒登録
- `GET /students` — 生徒一覧
- `GET /students/:id` — 生徒詳細（出席率統計を含む）
- `PATCH /students/:id` — 生徒更新
- `DELETE /students/:id` — 生徒削除（論理削除）
- `POST /students/:id/parents` — 保護者紐づけ
- `DELETE /students/:id/parents/:userId` — 保護者紐づけ解除
- `POST /students/:id/courses` — コース登録（enrollment）
- `DELETE /students/:id/courses/:courseId` — コース登録解除

**course**
- `POST /courses` — コース作成
- `GET /courses` — コース一覧
- `PATCH /courses/:id` — コース更新
- `DELETE /courses/:id` — コース削除（論理削除）

**lesson**
- `GET /lessons/weekly` — 今週のレッスン一覧
- `GET /lessons/daily?date=` — 指定日のレッスン一覧
- `POST /lessons/slots` — レッスン枠登録
- `PATCH /lessons/slots/:id` — レッスン枠変更
- `DELETE /lessons/slots/:id` — レッスン枠削除（論理削除）
- `POST /lessons/generate` — 月間セッション一括生成（後述の生成仕様を参照）
- `GET /lessons/available-slots` — 振替可能な空き枠
- `GET /lessons/sessions/:id` — セッション詳細
- `PATCH /lessons/sessions/:id` — セッション更新（ステータス変更、休講→自動通知）
- `POST /lessons/sessions` — アドホックセッション作成（手動振替等）

**attendance**
- `POST /attendance` — 出欠記録（バッチ対応）
- `GET /students/:id/attendance` — 生徒別出席履歴
- `GET /students/:id/attendance/stats?year=&month=` — 月間出席率統計
- `GET /lessons/sessions/:id/attendance` — セッション別出欠一覧

**absence（保護者からの欠席連絡）**
- `POST /absences` — 欠席連絡（保護者がWeb経由で送信）

**lesson-note**
- `POST /lesson-notes` — メモ保存
- `GET /students/:id/lesson-notes` — 生徒別メモ一覧
- `POST /lesson-notes/:id/generate-report` — AIレポート生成
- `PATCH /lesson-notes/:id` — レポート編集
- `POST /lesson-notes/:id/send` — LINE配信

**monthly-summary**
- `POST /monthly-summaries/generate` — 月次サマリーAI生成（生徒単位）
- `GET /monthly-summaries?year=&month=` — 月次サマリー一覧
- `PATCH /monthly-summaries/:id` — サマリー編集
- `POST /monthly-summaries/:id/send` — LINE配信

**reschedule**
- `POST /reschedules` — 振替申請（保護者）
- `GET /reschedules` — リクエスト一覧
- `PATCH /reschedules/:id` — 承認/却下（先生）

**payment**
- `GET /payments` — 月謝一覧（月別フィルタ）
- `POST /payments/generate` — 月次請求一括生成
- `PATCH /payments/:id` — 入金確認
- `GET /payments/summary` — 月次入金サマリー

**line**
- `POST /line/webhook` — 欠席連絡・振替申請の受信

### セッション一括生成仕様（POST /lessons/generate）

- **入力**: `{ year, month }`
- **動作**: テナント内の全アクティブ `LessonSlot` を取得し、指定月の該当曜日ごとに `LessonSession` を生成
- **冪等性**: 同一 `lessonSlotId + date` の組み合わせが既に存在する場合はスキップ（2回実行しても重複しない）
- **戻り値**: `{ created: number, skipped: number }`

### 定期ジョブ

| ジョブ | スケジュール | 内容 |
|---|---|---|
| レッスンリマインド | 毎日 9:00 JST | 翌日のレッスンの保護者にLINE通知 |
| 月謝未納リマインド | 毎月15日 9:00 JST | UNPAID ステータスの月謝の保護者にLINE通知 |
| 月謝ステータス更新 | 毎月1日 0:00 JST | 前月の UNPAID を OVERDUE に変更 |

### LINE会話ステート管理

欠席→振替の多段フローでは、各ステップの状態を保持する必要がある。LINE の Postback データにステート情報を埋め込む方式を採用:

```
Postback data: "action=absence&sessionId=xxx"
Postback data: "action=reschedule_confirm&sessionId=xxx"
Postback data: "action=reschedule_select&sessionId=xxx&targetSessionId=yyy"
```

ステートレスで各アクションを処理でき、Redis やDBへのセッション保存が不要。複数の子どもがいる保護者の場合、直近レッスンの提示時に生徒名をボタンラベルに含めて曖昧さを排除する。

## フロントエンド構成

```
app/
├── (teacher)/                    # 先生向け（モバイルファースト、ボトムナビ）
│   ├── layout.tsx                # ボトムナビ: ホーム/出欠/振替/月謝/設定
│   ├── page.tsx                  # ホーム: 今日のレッスン一覧
│   ├── attendance/
│   │   └── page.tsx              # 出欠記録（レッスン選択→タップで記録）
│   ├── attendance/[sessionId]/
│   │   └── page.tsx              # 個別レッスンの出欠 + メモ入力
│   ├── reschedules/
│   │   └── page.tsx              # 振替リクエスト一覧（承認/却下）
│   ├── payments/
│   │   └── page.tsx              # 月謝一覧（月別、未納ハイライト）
│   ├── students/
│   │   ├── page.tsx              # 生徒一覧
│   │   ├── new/page.tsx          # 生徒登録
│   │   └── [id]/page.tsx         # 生徒詳細（出席履歴・レポート履歴）
│   ├── courses/
│   │   └── page.tsx              # コース管理
│   ├── schedule/
│   │   └── page.tsx              # 週間スケジュール（タイムテーブル表示）
│   ├── reports/
│   │   └── page.tsx              # レポート管理（メモ→AI生成→送信）
│   └── settings/
│       └── page.tsx              # 教室設定
│
├── (parent)/                     # 保護者向け（LINE補助、ミニマル）
│   ├── layout.tsx                # ミニマルヘッダー
│   ├── page.tsx                  # 直近レッスン・レポート
│   ├── reports/
│   │   └── page.tsx              # レポート履歴
│   ├── schedule/
│   │   └── page.tsx              # スケジュール確認
│   ├── absence/
│   │   └── page.tsx              # 欠席連絡（Web経由）
│   └── payments/
│       └── page.tsx              # 月謝支払い状況
│
├── auth/
│   ├── login/page.tsx            # 先生ログイン
│   └── verify/page.tsx           # マジックリンク検証（保護者用）
│
├── lp/
│   └── page.tsx                  # ランディングページ
│
└── api/
    └── line/webhook/route.ts     # LINE Webhook
```

## AI連携

### レッスンレポート生成

- **入力**: teacherMemo + genre + studentName + courseName
- **出力**: 保護者向けレポート（200〜400字）
- **トーン**: 温かく前向き、具体的な改善点も含む
- **制約**: 先生が編集してから送信（AI出力をそのまま送らない）
- **API**: Claude API をバックエンドから呼び出し
- **コスト**: 約$0.005/件、教室あたり月$1程度

### 月次サマリー生成

- **入力**: 当月の全LessonNote + Attendanceデータ
- **出力**: 月間進捗まとめ + 来月の目標提案（300〜600字）
- **先生が確認・編集してから配信**

### 振替サジェスト

- **入力**: 生徒のスケジュール + 空き枠 + 過去の振替履歴
- **出力**: おすすめ振替候補（最大3枠）+ 理由
- **ルールベース + AI補助**のハイブリッド

### 運用設計

- NestJS バックエンドから Claude API を呼び出し（フロントから直接呼ばない）
- `ai/` モジュールに `AiReportService` を配置
- レート制限: 1教室あたり1分間10リクエスト
- フォールバック: API障害時は先生のメモをそのまま表示

## LINE連携

### 基本方針

- LINE公式アカウントはSaaS全体で1つ
- 保護者はアカウント作成不要、友達追加のみで利用開始

### 保護者オンボーディング

1. 先生が生徒を登録 → 招待QRコード/リンクを生成
2. 保護者がQR読み取り → LINE公式アカウントを友達追加
3. followイベント発火 → トークンで生徒と自動紐づけ
4. 完了。以降LINEで通知を受信

### LINE内で完結する操作

| 操作 | 方式 |
|---|---|
| レッスンレポート受信 | Flex Message |
| レッスン前日リマインド | テキスト |
| 欠席連絡 | テキスト送信 or リッチメニュー |
| 振替申請 | 空き枠をFlex Messageで提示→ボタン選択 |
| 振替結果通知 | テキスト |
| 月謝リマインド | テキスト |

### Webに遷移する操作

| 操作 | 理由 |
|---|---|
| レポート履歴一覧 | 一覧表示はWebが適切 |
| スケジュール全体確認 | カレンダー表示 |
| 月謝支払い履歴 | 一覧表示 |

### 欠席→振替フロー

```
保護者: 「欠席」と送信 or リッチメニュー
  → Bot: 「どのレッスンを欠席しますか？」（直近レッスンをボタン表示）
  → 保護者: ボタンタップ
  → Bot: 「欠席を受け付けました。振替しますか？」 [する/しない]
  → 保護者: [する]
  → Bot: 空き枠をFlex Messageで提示（AIサジェスト）
  → 保護者: 枠を選択
  → Bot: 「申請しました。先生の承認後にお知らせします」
  → 先生にプッシュ: 振替申請通知 [承認/別枠を提案]
```

## 既存コードの流用/削除マップ

### 流用（構造維持、内容調整）

| 対象 | 変更点 |
|---|---|
| `common/guards/` | Role を TEACHER/PARENT に変更 |
| `common/decorators/` | そのまま |
| `common/interceptors/` | TenantInterceptor そのまま |
| `modules/auth/` | 認証フロー維持、LINE Login を保護者向けに調整 |
| `modules/tenant/` | genre フィールド追加 |
| `modules/prisma/` | そのまま |
| `modules/mail/` | そのまま |
| `modules/line/` | Webhook を欠席・振替フローに書き換え |
| `modules/notification/` | NotificationType を新タイプに変更 |

### 削除

| 対象 | 理由 |
|---|---|
| `modules/circular/` | ドメイン変更 |
| `modules/answer/` | ドメイン変更 |
| `modules/read/` | ドメイン変更 |
| `modules/template/` | ドメイン変更 |
| `modules/group/` | Student + Course で代替 |
| `modules/user/` | 新規の student/ + 保護者管理に置換 |
| `app/(admin)/*` | → (teacher) に置換 |
| `app/(resident)/*` | → (parent) に置換 |
| Prisma: Circular, CircularRead, CircularQuestion, CircularAnswer, Template, Group, Invitation | 回覧板ドメイン全て |
| Enum: CircularType, CircularStatus, TargetType, QuestionType, InvitationMethod, InvitationStatus | 同上 |

### 新規作成

| 対象 | 概要 |
|---|---|
| `modules/parent/` | 保護者管理、招待リンク生成 |
| `modules/student/` | 生徒CRUD + 保護者紐づけ + コース登録 |
| `modules/course/` | コースCRUD |
| `modules/lesson/` | スケジュール管理 + セッション生成・CRUD |
| `modules/attendance/` | 出欠記録 + 統計 |
| `modules/absence/` | 保護者からの欠席連絡 |
| `modules/lesson-note/` | メモ + AIレポート生成 |
| `modules/monthly-summary/` | 月次サマリー管理 |
| `modules/reschedule/` | 振替リクエスト管理（振替上限チェック含む） |
| `modules/payment/` | 月謝管理 |
| `modules/ai/` | Claude APIクライアント |
| `app/(teacher)/*` | 先生向け全ページ |
| `app/(parent)/*` | 保護者向け全ページ |
