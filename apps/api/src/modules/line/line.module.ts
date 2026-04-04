import { Module } from "@nestjs/common";
import { LineService } from "./line.service";
import { LineWebhookController } from "./line-webhook.controller";
import { AnswerModule } from "../answer/answer.module";

@Module({
  imports: [AnswerModule],
  controllers: [LineWebhookController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
