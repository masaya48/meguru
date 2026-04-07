# SPEC-004: LINE連携仕様

## 概要

LINE Messaging APIを使用し、回覧の通知と簡易回答をLINEトーク内で提供する。

## LINE公式アカウント

- SaaS全体で1つの公式アカウントを使用
- メッセージにテナント情報（自治会名）を含めて識別

## Webhook処理フロー

Next.js API Routeを経由する理由: Vercelを単一のイングレスポイントとし、署名検証をエッジで行うため。

```
LINE Platform → Next.js API Route (/api/line/webhook)
  → 署名検証
  → NestJS LINE モジュールへ転送
    → イベント種別に応じて処理
    → テナント解決: postback data内のcircularIdからテナントを逆引き
```

### イベント種別

| イベント       | 処理                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| follow         | ユーザーの友達追加を記録                                                    |
| postback       | 出欠回答の記録（data パラメータから circularId, questionId, answer を取得） |
| message (text) | 未対応テキストへの案内メッセージ返信                                        |

## 通知メッセージ

### 新着回覧通知（Flex Message）

```json
{
  "type": "flex",
  "altText": "【○○町内会】春の一斉清掃のお知らせ",
  "contents": {
    "type": "bubble",
    "header": {
      "type": "box",
      "contents": [{ "type": "text", "text": "○○町内会", "size": "sm", "color": "#2563EB" }]
    },
    "body": {
      "type": "box",
      "contents": [
        { "type": "text", "text": "春の一斉清掃のお知らせ", "weight": "bold", "size": "lg" },
        { "type": "text", "text": "出欠確認", "size": "sm", "color": "#64748B" }
      ]
    },
    "footer": {
      "type": "box",
      "contents": [
        {
          "type": "button",
          "action": { "type": "uri", "label": "見る", "uri": "https://meguru.app/circular/{id}" },
          "style": "primary"
        }
      ]
    }
  }
}
```

### 出欠確認通知（Postbackボタン付き）

footerに以下を追加:

```json
{
  "type": "box",
  "layout": "horizontal",
  "contents": [
    {
      "type": "button",
      "action": {
        "type": "postback",
        "label": "⭕ 参加する",
        "data": "action=answer&circularId={id}&questionId={qid}&answer=yes"
      },
      "style": "primary",
      "color": "#16A34A"
    },
    {
      "type": "button",
      "action": {
        "type": "postback",
        "label": "❌ 不参加",
        "data": "action=answer&circularId={id}&questionId={qid}&answer=no"
      },
      "style": "primary",
      "color": "#DC2626"
    }
  ]
}
```

### リマインド通知

- 送信タイミング: 回答期限の前日
- 対象: 未回答のLINE連携ユーザー
- 実装: NestJSのCronジョブで毎日チェック

## ユーザーとLINEアカウントの紐付け

1. Web設定画面で「LINEと連携する」ボタンをタップ
2. LINE Login（OAuth 2.0）で認証
3. 取得した `lineUserId` をUserテーブルに保存
4. 以降、通知対象のユーザーにLINE連携があればLINEで送信
