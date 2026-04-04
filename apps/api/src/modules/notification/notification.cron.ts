import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { NotificationService } from "./notification.service";

@Injectable()
export class NotificationCron {
  private readonly logger = new Logger(NotificationCron.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleReminders() {
    this.logger.log("Running daily reminder check...");
    await this.notificationService.sendReminders();
    this.logger.log("Reminder check complete.");
  }
}
