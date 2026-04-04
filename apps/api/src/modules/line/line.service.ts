import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { messagingApi, validateSignature, type WebhookEvent } from "@line/bot-sdk";
import type { Message } from "@line/bot-sdk/dist/messaging-api/model/message";

@Injectable()
export class LineService {
  private client: messagingApi.MessagingApiClient;
  private channelSecret: string;
  private appUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>("LINE_CHANNEL_ACCESS_TOKEN") ?? "";
    this.channelSecret = this.configService.get<string>("LINE_CHANNEL_SECRET") ?? "";
    this.appUrl = this.configService.get<string>("APP_URL") ?? "http://localhost:3000";

    this.client = new messagingApi.MessagingApiClient({ channelAccessToken: accessToken });
  }

  getAppUrl(): string {
    return this.appUrl;
  }

  verifySignature(body: string, signature: string): boolean {
    return validateSignature(body, this.channelSecret, signature);
  }

  async pushMessage(lineUserId: string, messages: Message[]) {
    await this.client.pushMessage({
      to: lineUserId,
      messages,
    });
  }

  async replyMessage(replyToken: string, messages: Message[]) {
    await this.client.replyMessage({
      replyToken,
      messages,
    });
  }

  parseEvents(body: Record<string, unknown>): WebhookEvent[] {
    return (body.events as WebhookEvent[]) ?? [];
  }
}
