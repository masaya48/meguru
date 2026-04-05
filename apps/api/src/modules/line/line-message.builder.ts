import type { FlexMessage, TextMessage } from "@line/bot-sdk/dist/messaging-api/model/models";

const PRIMARY_COLOR = "#2D6A4F";

export function buildLessonReportMessage(params: {
  studentName: string;
  courseName: string;
  date: string;
  reportText: string;
  detailUrl: string;
}): FlexMessage {
  return {
    type: "flex",
    altText: `${params.studentName}さんのレッスンレポート`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "\u{1F3B5} レッスンレポート", weight: "bold", size: "lg" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: `${params.studentName} / ${params.courseName}`,
            size: "sm",
            color: "#888888",
          },
          { type: "text", text: params.date, size: "sm", color: "#888888" },
          { type: "separator" },
          { type: "text", text: params.reportText, wrap: true, size: "md" },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: PRIMARY_COLOR,
            action: { type: "uri", label: "詳しく見る", uri: params.detailUrl },
          },
        ],
      },
    },
  };
}

export function buildLessonReminderMessage(params: {
  studentName: string;
  courseName: string;
  date: string;
  startTime: string;
}): TextMessage {
  return {
    type: "text",
    text: [
      `\u{1F514} レッスンリマインダー`,
      ``,
      `${params.studentName}さんの${params.courseName}レッスン`,
      `\u{1F4C5} ${params.date} ${params.startTime}〜`,
      ``,
      `忘れ物がないようご準備ください。`,
    ].join("\n"),
  };
}

export function buildRescheduleRequestMessage(params: {
  studentName: string;
  originalDate: string;
  originalTime: string;
  approveData: string;
  rejectData: string;
}): FlexMessage {
  return {
    type: "flex",
    altText: `${params.studentName}さんの振替リクエスト`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [{ type: "text", text: "\u{1F504} 振替リクエスト", weight: "bold", size: "lg" }],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: `生徒: ${params.studentName}`, size: "md", wrap: true },
          {
            type: "text",
            text: `元の日時: ${params.originalDate} ${params.originalTime}`,
            size: "sm",
            color: "#888888",
          },
          { type: "separator" },
          { type: "text", text: "承認しますか？", size: "sm", color: "#666666" },
        ],
      },
      footer: {
        type: "box",
        layout: "horizontal",
        spacing: "md",
        contents: [
          {
            type: "button",
            style: "primary",
            color: PRIMARY_COLOR,
            action: { type: "postback", label: "承認", data: params.approveData },
          },
          {
            type: "button",
            style: "secondary",
            action: { type: "postback", label: "却下", data: params.rejectData },
          },
        ],
      },
    },
  };
}

export function buildRescheduleResultMessage(params: {
  studentName: string;
  approved: boolean;
  newDate?: string;
  newTime?: string;
}): TextMessage {
  if (params.approved) {
    const schedule = params.newDate
      ? `\n新しい日時: ${params.newDate} ${params.newTime ?? ""}`
      : "";
    return {
      type: "text",
      text: `\u2705 ${params.studentName}さんの振替が承認されました。${schedule}\n\n詳細はアプリでご確認ください。`,
    };
  }
  return {
    type: "text",
    text: `\u274C ${params.studentName}さんの振替リクエストが却下されました。\n\n詳細はアプリでご確認ください。`,
  };
}

export function buildPaymentReminderMessage(params: {
  studentName: string;
  courseName: string;
  amount: number;
  month: string;
}): TextMessage {
  return {
    type: "text",
    text: [
      `\u{1F4B0} お支払いリマインダー`,
      ``,
      `${params.studentName}さん / ${params.courseName}`,
      `${params.month}分: ¥${params.amount.toLocaleString()}`,
      ``,
      `お支払いをお願いいたします。`,
    ].join("\n"),
  };
}

export function buildAbsenceConfirmMessage(params: {
  studentName: string;
  date: string;
  time: string;
  rescheduleData: string;
  noRescheduleData: string;
}): FlexMessage {
  return {
    type: "flex",
    altText: `${params.studentName}さんの欠席連絡を受け付けました`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [{ type: "text", text: "\u{1F4DD} 欠席受付", weight: "bold", size: "lg" }],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          { type: "text", text: `${params.studentName}さん`, size: "md" },
          {
            type: "text",
            text: `${params.date} ${params.time}`,
            size: "sm",
            color: "#888888",
          },
          { type: "separator" },
          { type: "text", text: "振替を希望しますか？", size: "sm", color: "#666666" },
        ],
      },
      footer: {
        type: "box",
        layout: "horizontal",
        spacing: "md",
        contents: [
          {
            type: "button",
            style: "primary",
            color: PRIMARY_COLOR,
            action: { type: "postback", label: "振替希望", data: params.rescheduleData },
          },
          {
            type: "button",
            style: "secondary",
            action: {
              type: "postback",
              label: "振替なし",
              data: params.noRescheduleData,
            },
          },
        ],
      },
    },
  };
}
