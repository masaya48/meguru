import { Body, Controller, Post, Logger } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import type { WebhookEvent } from "@line/bot-sdk";
import { LineService } from "./line.service";
import { RescheduleService } from "../reschedule/reschedule.service";
import { NotificationService } from "../notification/notification.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("line")
export class LineWebhookController {
  private readonly logger = new Logger(LineWebhookController.name);

  constructor(
    private readonly lineService: LineService,
    private readonly rescheduleService: RescheduleService,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
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
        // TODO: Parent onboarding flow — link LINE user to manabun account
        break;

      case "message":
        if (event.message.type === "text") {
          await this.handleTextMessage(event);
        }
        break;

      case "postback":
        await this.handlePostback(event);
        break;
    }
  }

  private async handleTextMessage(event: WebhookEvent & { type: "message" }) {
    if (event.message.type !== "text") return;
    const text = event.message.text;
    const appUrl = this.lineService.getAppUrl();

    if (text.includes("欠席")) {
      await this.lineService.replyMessage(event.replyToken, [
        {
          type: "text",
          text: `欠席連絡はWebから行ってください。\n${appUrl}`,
        },
      ]);
      return;
    }

    await this.lineService.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "manabun をご利用いただきありがとうございます。",
      },
    ]);
  }

  private async handlePostback(event: WebhookEvent & { type: "postback" }) {
    const data = new URLSearchParams(event.postback.data);
    const action = data.get("action");
    const requestId = data.get("requestId");

    this.logger.log(`Postback: action=${action}, requestId=${requestId}`);

    switch (action) {
      case "reschedule_approve": {
        if (!requestId) break;
        try {
          const request = await this.prisma.rescheduleRequest.findUnique({
            where: { id: requestId },
            select: { id: true, tenantId: true, originalSessionId: true, status: true },
          });
          if (!request || request.status !== "PENDING") {
            await this.lineService.replyMessage(event.replyToken, [
              { type: "text", text: "該当するリクエストが見つかりませんでした。" },
            ]);
            break;
          }
          // Quick-approve from LINE — mark as approved, teacher assigns target session later via web
          await this.prisma.$transaction([
            this.prisma.rescheduleRequest.update({
              where: { id: requestId },
              data: { status: "APPROVED" },
            }),
            this.prisma.lessonSession.update({
              where: { id: request.originalSessionId },
              data: { status: "RESCHEDULED" },
            }),
          ]);
          await this.lineService.replyMessage(event.replyToken, [
            {
              type: "text",
              text: "振替リクエストを承認しました。\nWebで振替先の日時を設定してください。",
            },
          ]);
          await this.notificationService.sendRescheduleResult(requestId);
        } catch (error) {
          this.logger.error(`Failed to approve reschedule ${requestId}`, error);
          await this.lineService.replyMessage(event.replyToken, [
            { type: "text", text: "承認処理に失敗しました。Webから操作してください。" },
          ]);
        }
        break;
      }

      case "reschedule_reject": {
        if (!requestId) break;
        try {
          const request = await this.prisma.rescheduleRequest.findUnique({
            where: { id: requestId },
            select: { id: true, tenantId: true, status: true },
          });
          if (!request || request.status !== "PENDING") {
            await this.lineService.replyMessage(event.replyToken, [
              { type: "text", text: "該当するリクエストが見つかりませんでした。" },
            ]);
            break;
          }
          await this.rescheduleService.reject(request.tenantId, requestId);
          await this.lineService.replyMessage(event.replyToken, [
            { type: "text", text: "振替リクエストを却下しました。" },
          ]);
          await this.notificationService.sendRescheduleResult(requestId);
        } catch (error) {
          this.logger.error(`Failed to reject reschedule ${requestId}`, error);
          await this.lineService.replyMessage(event.replyToken, [
            { type: "text", text: "却下処理に失敗しました。Webから操作してください。" },
          ]);
        }
        break;
      }

      default:
        this.logger.warn(`Unknown postback action: ${action}`);
    }
  }
}
