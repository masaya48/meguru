import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LineService } from "../line/line.service";
import { buildCircularNotification, buildReminderMessage } from "../line/line-message.builder";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly lineService: LineService,
  ) {}

  async notifyCircularPublished(circularId: string) {
    const circular = await this.prisma.circular.findUnique({
      where: { id: circularId },
      include: {
        questions: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });
    if (!circular) return;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: circular.tenantId },
    });
    if (!tenant) return;

    // Get target users with LINE connection
    const users = await this.prisma.user.findMany({
      where: {
        tenantId: circular.tenantId,
        status: "ACTIVE",
        lineUserId: { not: null },
        ...(circular.targetType === "GROUP" && circular.targetGroupIds.length > 0
          ? { groupId: { in: circular.targetGroupIds } }
          : {}),
      },
    });

    const appUrl = this.lineService.getAppUrl();
    const firstQuestion =
      circular.type === "ATTENDANCE" && circular.questions[0]
        ? {
            id: circular.questions[0].id,
            options: (circular.questions[0].options as string[]) ?? ["参加する", "不参加"],
          }
        : undefined;

    const message = buildCircularNotification({
      tenantName: tenant.name,
      title: circular.title,
      type: circular.type,
      circularId: circular.id,
      appUrl,
      question: firstQuestion,
    });

    for (const user of users) {
      if (!user.lineUserId) continue;

      try {
        await this.lineService.pushMessage(user.lineUserId, [message]);

        await this.prisma.notification.create({
          data: {
            tenantId: circular.tenantId,
            userId: user.id,
            circularId: circular.id,
            channel: "LINE",
            type: "NEW_CIRCULAR",
            status: "SENT",
            sentAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.error(`Failed to send LINE notification to ${user.id}`, error);
        await this.prisma.notification.create({
          data: {
            tenantId: circular.tenantId,
            userId: user.id,
            circularId: circular.id,
            channel: "LINE",
            type: "NEW_CIRCULAR",
            status: "FAILED",
          },
        });
      }
    }
  }

  async sendReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find published circulars with deadline tomorrow
    const circulars = await this.prisma.circular.findMany({
      where: {
        status: "PUBLISHED",
        type: { in: ["ATTENDANCE", "SURVEY"] },
        deadline: { gte: tomorrow, lt: dayAfterTomorrow },
      },
      include: {
        tenant: true,
        questions: true,
      },
    });

    for (const circular of circulars) {
      // Find users who haven't answered all questions
      const answeredUserIds = await this.prisma.circularAnswer.findMany({
        where: { question: { circularId: circular.id } },
        select: { userId: true },
        distinct: ["userId"],
      });
      const answeredSet = new Set(answeredUserIds.map((a) => a.userId));

      const unansweredUsers = await this.prisma.user.findMany({
        where: {
          tenantId: circular.tenantId,
          status: "ACTIVE",
          lineUserId: { not: null },
          id: { notIn: [...answeredSet] },
          ...(circular.targetType === "GROUP" && circular.targetGroupIds.length > 0
            ? { groupId: { in: circular.targetGroupIds } }
            : {}),
        },
      });

      const appUrl = this.lineService.getAppUrl();

      for (const user of unansweredUsers) {
        if (!user.lineUserId) continue;

        try {
          const message = buildReminderMessage(
            circular.tenant.name,
            circular.title,
            circular.id,
            appUrl,
          );

          await this.lineService.pushMessage(user.lineUserId, [message]);

          await this.prisma.notification.create({
            data: {
              tenantId: circular.tenantId,
              userId: user.id,
              circularId: circular.id,
              channel: "LINE",
              type: "REMINDER",
              status: "SENT",
              sentAt: new Date(),
            },
          });
        } catch (error) {
          this.logger.error(`Failed to send reminder to ${user.id}`, error);
        }
      }
    }
  }
}
