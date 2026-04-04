import { Body, Controller, Post, Logger } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import type { WebhookEvent } from "@line/bot-sdk";
import { LineService } from "./line.service";
import { PrismaService } from "../prisma/prisma.service";
import { AnswerService } from "../answer/answer.service";

@Controller("line")
export class LineWebhookController {
  private readonly logger = new Logger(LineWebhookController.name);

  constructor(
    private readonly lineService: LineService,
    private readonly prisma: PrismaService,
    private readonly answerService: AnswerService,
  ) {}

  @Public()
  @Post("webhook")
  async handleWebhook(@Body() body: { events: WebhookEvent[] }) {
    const events = body.events ?? [];

    for (const event of events) {
      try {
        await this.processEvent(event);
      } catch (error) {
        this.logger.error(`Failed to process event: ${event.type}`, error);
      }
    }

    return { ok: true };
  }

  private async processEvent(event: WebhookEvent) {
    switch (event.type) {
      case "follow":
        this.logger.log(`New follower: ${event.source.userId}`);
        break;

      case "postback":
        await this.handlePostback(event);
        break;

      case "message":
        if (event.message.type === "text") {
          await this.lineService.replyMessage(event.replyToken, [
            {
              type: "text",
              text: "めぐるをご利用いただきありがとうございます。回覧の確認はアプリからお願いします。",
            },
          ]);
        }
        break;
    }
  }

  private async handlePostback(event: Extract<WebhookEvent, { type: "postback" }>) {
    const params = new URLSearchParams(event.postback.data);
    const action = params.get("action");

    if (action !== "answer") return;

    const circularId = params.get("circularId");
    const questionId = params.get("questionId");
    const answer = params.get("answer");

    if (!circularId || !questionId || !answer) return;

    const lineUserId = event.source.userId;
    if (!lineUserId) return;

    // Find user by lineUserId
    const user = await this.prisma.user.findFirst({
      where: { lineUserId },
    });
    if (!user) {
      await this.lineService.replyMessage(event.replyToken, [
        {
          type: "text",
          text: "LINE連携が完了していません。アプリの設定画面からLINE連携を行ってください。",
        },
      ]);
      return;
    }

    try {
      await this.answerService.submit(user.tenantId, user.id, {
        questionId,
        answer: decodeURIComponent(answer),
      });

      await this.lineService.replyMessage(event.replyToken, [
        { type: "text", text: `回答を記録しました: ${decodeURIComponent(answer)}` },
      ]);
    } catch (error) {
      this.logger.error(`Failed to submit answer via LINE`, error);
      await this.lineService.replyMessage(event.replyToken, [
        { type: "text", text: "回答の記録に失敗しました。アプリから回答してください。" },
      ]);
    }
  }
}
