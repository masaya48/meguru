import { Module, forwardRef } from "@nestjs/common";
import { LineService } from "./line.service";
import { LineWebhookController } from "./line-webhook.controller";
import { RescheduleModule } from "../reschedule/reschedule.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [RescheduleModule, forwardRef(() => NotificationModule)],
  controllers: [LineWebhookController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
