import { Body, Controller, Post, Logger } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import type { WebhookEvent } from "@line/bot-sdk";
import { LineService } from "./line.service";

@Controller("line")
export class LineWebhookController {
  private readonly logger = new Logger(LineWebhookController.name);

  constructor(private readonly lineService: LineService) {}

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

      case "message":
        if (event.message.type === "text") {
          await this.lineService.replyMessage(event.replyToken, [
            {
              type: "text",
              text: "manabun をご利用いただきありがとうございます。",
            },
          ]);
        }
        break;
    }
  }
}
