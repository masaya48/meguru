import { Module } from "@nestjs/common";
import { LineService } from "./line.service";
import { LineWebhookController } from "./line-webhook.controller";

@Module({
  controllers: [LineWebhookController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
