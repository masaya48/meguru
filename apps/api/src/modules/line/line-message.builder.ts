import type { FlexBubble } from "@line/bot-sdk/dist/messaging-api/model/flexBubble";
import type { FlexMessage } from "@line/bot-sdk/dist/messaging-api/model/flexMessage";

interface CircularNotification {
  tenantName: string;
  title: string;
  type: string;
  circularId: string;
  appUrl: string;
  question?: {
    id: string;
    options: string[];
  };
}

const TYPE_LABELS: Record<string, string> = {
  NOTICE: "お知らせ",
  SURVEY: "アンケート",
  ATTENDANCE: "出欠確認",
};

export function buildCircularNotification(data: CircularNotification): FlexMessage {
  const footer: FlexBubble["footer"] = {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    contents: [
      {
        type: "button",
        action: {
          type: "uri",
          label: "見る",
          uri: `${data.appUrl}/circular/${data.circularId}`,
        },
        style: "primary",
        color: "#2D6A4F",
      },
    ],
  };

  // Add postback buttons for ATTENDANCE with YES_NO question
  if (data.type === "ATTENDANCE" && data.question) {
    footer.contents = [
      {
        type: "box",
        layout: "horizontal",
        spacing: "sm",
        contents: [
          {
            type: "button",
            action: {
              type: "postback",
              label: `⭕ ${data.question.options[0] ?? "参加する"}`,
              data: `action=answer&circularId=${data.circularId}&questionId=${data.question.id}&answer=${encodeURIComponent(data.question.options[0] ?? "参加する")}`,
            },
            style: "primary",
            color: "#16A34A",
          },
          {
            type: "button",
            action: {
              type: "postback",
              label: `❌ ${data.question.options[1] ?? "不参加"}`,
              data: `action=answer&circularId=${data.circularId}&questionId=${data.question.id}&answer=${encodeURIComponent(data.question.options[1] ?? "不参加")}`,
            },
            style: "primary",
            color: "#DC2626",
          },
        ],
      },
      {
        type: "button",
        action: {
          type: "uri",
          label: "詳細を見る",
          uri: `${data.appUrl}/circular/${data.circularId}`,
        },
        style: "link",
      },
    ];
  }

  const bubble: FlexBubble = {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [{ type: "text", text: data.tenantName, size: "sm", color: "#2D6A4F" }],
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        { type: "text", text: data.title, weight: "bold", size: "lg", wrap: true },
        { type: "text", text: TYPE_LABELS[data.type] ?? data.type, size: "sm", color: "#6B7280" },
      ],
    },
    footer,
  };

  return {
    type: "flex",
    altText: `【${data.tenantName}】${data.title}`,
    contents: bubble,
  };
}

export function buildReminderMessage(
  tenantName: string,
  title: string,
  circularId: string,
  appUrl: string,
): FlexMessage {
  return {
    type: "flex",
    altText: `【${tenantName}】回答リマインド: ${title}`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "回答リマインド", size: "sm", color: "#E76F51", weight: "bold" },
          { type: "text", text: title, weight: "bold", size: "lg", wrap: true, margin: "md" },
          {
            type: "text",
            text: `${tenantName}からの回覧に未回答です。`,
            size: "sm",
            color: "#6B7280",
            margin: "md",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: { type: "uri", label: "回答する", uri: `${appUrl}/circular/${circularId}` },
            style: "primary",
            color: "#E76F51",
          },
        ],
      },
    },
  };
}
