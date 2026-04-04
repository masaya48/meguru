import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class NotificationCron {
  private readonly logger = new Logger(NotificationCron.name);

  // TODO: Implement manabun cron jobs in Phase 5
}
