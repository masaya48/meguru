# SPEC-002: データモデル

## ER図（概要）

```
Tenant 1──* User
Tenant 1──* Group
Tenant 1──* Circular
Tenant 1──* Template
Tenant 1──* Invitation

Group  1──* User (所属)

Circular 1──* CircularRead
Circular 1──* CircularQuestion
CircularQuestion 1──* CircularAnswer

User 1──* CircularRead
User 1──* CircularAnswer
User 1──* Notification
```

## テーブル定義

### Tenant（自治会）

| カラム    | 型           | 説明                          |
| --------- | ------------ | ----------------------------- |
| id        | UUID         | PK                            |
| name      | VARCHAR(100) | 自治会名                      |
| slug      | VARCHAR(50)  | URL用識別子（ユニーク）       |
| plan      | VARCHAR(20)  | 料金プラン（MVP: 'free'固定） |
| createdAt | TIMESTAMP    | 作成日時                      |
| updatedAt | TIMESTAMP    | 更新日時                      |

### User（ユーザー）

| カラム       | 型                                   | 説明                                   |
| ------------ | ------------------------------------ | -------------------------------------- |
| id           | UUID                                 | PK                                     |
| tenantId     | UUID                                 | FK → Tenant                            |
| groupId      | UUID?                                | FK → Group（任意。1ユーザー1グループ） |
| name         | VARCHAR(50)                          | 氏名                                   |
| email        | VARCHAR(255)?                        | メールアドレス                         |
| phone        | VARCHAR(20)?                         | 電話番号                               |
| lineUserId   | VARCHAR(100)?                        | LINE ユーザーID                        |
| passwordHash | VARCHAR(255)?                        | パスワードハッシュ（管理者用）         |
| role         | ENUM('ADMIN', 'MEMBER')              | 役割                                   |
| status       | ENUM('ACTIVE', 'PENDING', 'INVITED') | 状態                                   |
| createdAt    | TIMESTAMP                            | 作成日時                               |
| updatedAt    | TIMESTAMP                            | 更新日時                               |

### Group（班・組）

| カラム    | 型          | 説明        |
| --------- | ----------- | ----------- |
| id        | UUID        | PK          |
| tenantId  | UUID        | FK → Tenant |
| name      | VARCHAR(50) | グループ名  |
| sortOrder | INT         | 表示順      |
| createdAt | TIMESTAMP   | 作成日時    |
| updatedAt | TIMESTAMP   | 更新日時    |

### Circular（回覧）

| カラム         | 型                                     | 説明                                |
| -------------- | -------------------------------------- | ----------------------------------- |
| id             | UUID                                   | PK                                  |
| tenantId       | UUID                                   | FK → Tenant                         |
| createdById    | UUID                                   | FK → User（作成者）                 |
| templateId     | UUID?                                  | FK → Template（テンプレから作成時） |
| title          | VARCHAR(200)                           | タイトル                            |
| body           | TEXT                                   | 本文（リッチテキスト）              |
| type           | ENUM('NOTICE', 'SURVEY', 'ATTENDANCE') | 種類                                |
| status         | ENUM('DRAFT', 'PUBLISHED', 'CLOSED')   | 状態                                |
| targetType     | ENUM('ALL', 'GROUP')                   | 配信対象                            |
| targetGroupIds | UUID[]                                 | 対象グループID（GROUP指定時）       |
| deadline       | TIMESTAMP?                             | 回答期限                            |
| publishedAt    | TIMESTAMP?                             | 配信日時                            |
| closedAt       | TIMESTAMP?                             | 終了日時                            |
| createdAt      | TIMESTAMP                              | 作成日時                            |
| updatedAt      | TIMESTAMP                              | 更新日時                            |

### CircularRead（既読）

| カラム     | 型        | 説明          |
| ---------- | --------- | ------------- |
| id         | UUID      | PK            |
| circularId | UUID      | FK → Circular |
| userId     | UUID      | FK → User     |
| readAt     | TIMESTAMP | 既読日時      |

- UNIQUE制約: (circularId, userId)

### CircularQuestion（質問）

| カラム       | 型                                                           | 説明                                 |
| ------------ | ------------------------------------------------------------ | ------------------------------------ |
| id           | UUID                                                         | PK                                   |
| circularId   | UUID                                                         | FK → Circular                        |
| questionText | VARCHAR(500)                                                 | 質問文                               |
| type         | ENUM('YES_NO', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'FREE_TEXT') | 質問タイプ                           |
| options      | JSONB?                                                       | 選択肢（例: ["参加する", "不参加"]） |
| sortOrder    | INT                                                          | 表示順                               |
| createdAt    | TIMESTAMP                                                    | 作成日時                             |

### CircularAnswer（回答）

| カラム     | 型        | 説明                  |
| ---------- | --------- | --------------------- |
| id         | UUID      | PK                    |
| questionId | UUID      | FK → CircularQuestion |
| userId     | UUID      | FK → User             |
| answer     | JSONB     | 回答内容              |
| answeredAt | TIMESTAMP | 回答日時              |

- UNIQUE制約: (questionId, userId)

### Template（テンプレート）

| カラム       | 型                                     | 説明                 |
| ------------ | -------------------------------------- | -------------------- |
| id           | UUID                                   | PK                   |
| tenantId     | UUID                                   | FK → Tenant          |
| name         | VARCHAR(100)                           | テンプレート名       |
| description  | VARCHAR(500)?                          | 説明                 |
| bodyTemplate | TEXT                                   | 本文テンプレート     |
| type         | ENUM('NOTICE', 'SURVEY', 'ATTENDANCE') | 種類                 |
| questions    | JSONB?                                 | テンプレート質問定義 |
| createdAt    | TIMESTAMP                              | 作成日時             |
| updatedAt    | TIMESTAMP                              | 更新日時             |

### Invitation（招待）

| カラム      | 型                                     | 説明                     |
| ----------- | -------------------------------------- | ------------------------ |
| id          | UUID                                   | PK                       |
| tenantId    | UUID                                   | FK → Tenant              |
| invitedById | UUID                                   | FK → User（招待者）      |
| token       | VARCHAR(255)                           | 招待トークン（ユニーク） |
| method      | ENUM('EMAIL', 'LINE', 'QR')            | 招待方法                 |
| status      | ENUM('PENDING', 'ACCEPTED', 'EXPIRED') | 状態                     |
| expiresAt   | TIMESTAMP                              | 有効期限                 |
| createdAt   | TIMESTAMP                              | 作成日時                 |

### Notification（通知）

| カラム     | 型                                | 説明                                      |
| ---------- | --------------------------------- | ----------------------------------------- |
| id         | UUID                              | PK                                        |
| tenantId   | UUID                              | FK → Tenant                               |
| userId     | UUID                              | FK → User                                 |
| circularId | UUID                              | FK → Circular                             |
| channel    | ENUM('LINE')                      | 通知チャネル（MVP。将来WEB_PUSH追加予定） |
| type       | ENUM('NEW_CIRCULAR', 'REMINDER')  | 通知種類                                  |
| status     | ENUM('PENDING', 'SENT', 'FAILED') | 送信状態                                  |
| sentAt     | TIMESTAMP?                        | 送信日時                                  |
| createdAt  | TIMESTAMP                         | 作成日時                                  |

## インデックス

- User: (tenantId), (tenantId, email), (lineUserId)
- Circular: (tenantId, status), (tenantId, createdAt DESC)
- CircularRead: (circularId), (userId)
- CircularAnswer: (questionId), (userId)
- Notification: (tenantId, status), (userId, status)
- Invitation: (token), (tenantId, status)
