import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationCron } from "./notification.cron";
import { LineModule } from "../line/line.module";

@Module({
  imports: [LineModule],
  providers: [NotificationService, NotificationCron],
  exports: [NotificationService],
})
export class NotificationModule {}
