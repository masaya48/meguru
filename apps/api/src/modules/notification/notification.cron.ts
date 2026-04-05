import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "./notification.service";

@Injectable()
export class NotificationCron {
  private readonly logger = new Logger(NotificationCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /** Send lesson reminders for tomorrow's scheduled sessions (daily at 9:00 JST) */
  @Cron("0 9 * * *", { timeZone: "Asia/Tokyo" })
  async sendDailyReminders() {
    this.logger.log("Running daily lesson reminder cron");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    const sessions = await this.prisma.lessonSession.findMany({
      where: {
        date: new Date(dateStr),
        status: "SCHEDULED",
      },
    });

    this.logger.log(`Found ${sessions.length} sessions for ${dateStr}`);

    for (const session of sessions) {
      try {
        await this.notificationService.sendLessonReminder(session.id);
      } catch (error) {
        this.logger.error(`Failed to send reminder for session ${session.id}`, error);
      }
    }
  }

  /** Send payment reminders for unpaid invoices (monthly on 15th at 9:00 JST) */
  @Cron("0 9 15 * *", { timeZone: "Asia/Tokyo" })
  async sendPaymentReminders() {
    this.logger.log("Running payment reminder cron");

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const payments = await this.prisma.payment.findMany({
      where: {
        year,
        month,
        status: "UNPAID",
      },
    });

    this.logger.log(`Found ${payments.length} unpaid payments for ${year}-${month}`);

    for (const payment of payments) {
      try {
        await this.notificationService.sendPaymentReminder(payment.id);
      } catch (error) {
        this.logger.error(`Failed to send payment reminder for ${payment.id}`, error);
      }
    }
  }

  /** Mark last month's unpaid payments as overdue (monthly on 1st at 00:00 JST) */
  @Cron("0 0 1 * *", { timeZone: "Asia/Tokyo" })
  async updateOverduePayments() {
    this.logger.log("Running overdue payment update cron");

    const now = new Date();
    // Last month
    const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const result = await this.prisma.payment.updateMany({
      where: {
        year: lastMonthYear,
        month: lastMonth,
        status: "UNPAID",
      },
      data: {
        status: "OVERDUE",
      },
    });

    this.logger.log(
      `Updated ${result.count} payments to OVERDUE for ${lastMonthYear}-${lastMonth}`,
    );
  }
}
