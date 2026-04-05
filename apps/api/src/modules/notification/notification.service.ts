import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LineService } from "../line/line.service";
import {
  buildLessonReportMessage,
  buildLessonReminderMessage,
  buildRescheduleRequestMessage,
  buildRescheduleResultMessage,
  buildPaymentReminderMessage,
} from "../line/line-message.builder";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly lineService: LineService,
  ) {}

  /** Send lesson report flex message to all parents of the student */
  async sendLessonReport(noteId: string) {
    const note = await this.prisma.lessonNote.findUnique({
      where: { id: noteId },
      include: {
        student: { include: { studentParents: { include: { user: true } } } },
        lessonSession: { include: { course: true } },
      },
    });
    if (!note) {
      this.logger.warn(`LessonNote not found: ${noteId}`);
      return;
    }

    const appUrl = this.lineService.getAppUrl();
    const message = buildLessonReportMessage({
      studentName: note.student.name,
      courseName: note.lessonSession.course.name,
      date: note.lessonSession.date.toISOString().slice(0, 10),
      reportText: note.aiReport ?? note.teacherMemo,
      detailUrl: `${appUrl}/reports/${noteId}`,
    });

    const parents = note.student.studentParents.map((sp) => sp.user);
    await this.pushToUsers(note.tenantId, parents, [message], "REPORT", noteId);
  }

  /** Send lesson reminder to all parents of the student in the session */
  async sendLessonReminder(sessionId: string) {
    const session = await this.prisma.lessonSession.findUnique({
      where: { id: sessionId },
      include: {
        student: { include: { studentParents: { include: { user: true } } } },
        course: true,
      },
    });
    if (!session) {
      this.logger.warn(`LessonSession not found: ${sessionId}`);
      return;
    }

    const message = buildLessonReminderMessage({
      studentName: session.student.name,
      courseName: session.course.name,
      date: session.date.toISOString().slice(0, 10),
      startTime: session.startTime,
    });

    const parents = session.student.studentParents.map((sp) => sp.user);
    await this.pushToUsers(session.tenantId, parents, [message], "LESSON_REMINDER", sessionId);
  }

  /** Send reschedule request notification with approve/reject buttons to teacher */
  async sendRescheduleRequest(requestId: string) {
    const request = await this.prisma.rescheduleRequest.findUnique({
      where: { id: requestId },
      include: {
        originalSession: { include: { course: true } },
        student: true,
        tenant: { include: { users: { where: { role: "TEACHER" } } } },
      },
    });
    if (!request) {
      this.logger.warn(`RescheduleRequest not found: ${requestId}`);
      return;
    }

    const message = buildRescheduleRequestMessage({
      studentName: request.student.name,
      originalDate: request.originalSession.date.toISOString().slice(0, 10),
      originalTime: request.originalSession.startTime,
      approveData: `action=reschedule_approve&requestId=${requestId}`,
      rejectData: `action=reschedule_reject&requestId=${requestId}`,
    });

    const teachers = request.tenant.users;
    await this.pushToUsers(request.tenantId, teachers, [message], "RESCHEDULE", requestId);
  }

  /** Send reschedule result to the parent who made the request */
  async sendRescheduleResult(requestId: string) {
    const request = await this.prisma.rescheduleRequest.findUnique({
      where: { id: requestId },
      include: {
        student: true,
        requestedBy: true,
        requestedSession: true,
      },
    });
    if (!request) {
      this.logger.warn(`RescheduleRequest not found: ${requestId}`);
      return;
    }

    const approved = request.status === "APPROVED";
    const message = buildRescheduleResultMessage({
      studentName: request.student.name,
      approved,
      newDate: request.requestedSession?.date.toISOString().slice(0, 10),
      newTime: request.requestedSession?.startTime,
    });

    await this.pushToUsers(
      request.tenantId,
      [request.requestedBy],
      [message],
      "RESCHEDULE",
      requestId,
    );
  }

  /** Send payment reminder to all parents of the student */
  async sendPaymentReminder(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: { include: { studentParents: { include: { user: true } } } },
        course: true,
      },
    });
    if (!payment) {
      this.logger.warn(`Payment not found: ${paymentId}`);
      return;
    }

    const message = buildPaymentReminderMessage({
      studentName: payment.student.name,
      courseName: payment.course.name,
      amount: payment.amount,
      month: `${payment.year}年${payment.month}月`,
    });

    const parents = payment.student.studentParents.map((sp) => sp.user);
    await this.pushToUsers(payment.tenantId, parents, [message], "PAYMENT_REMINDER", paymentId);
  }

  /** Push messages to users who have a lineUserId, and record notifications */
  private async pushToUsers(
    tenantId: string,
    users: Array<{ id: string; lineUserId: string | null }>,
    messages: Parameters<LineService["pushMessage"]>[1],
    type: "LESSON_REMINDER" | "REPORT" | "RESCHEDULE" | "PAYMENT_REMINDER",
    referenceId: string,
  ) {
    for (const user of users) {
      if (!user.lineUserId) {
        this.logger.debug(`User ${user.id} has no lineUserId, skipping push`);
        continue;
      }

      try {
        await this.lineService.pushMessage(user.lineUserId, messages);
        await this.prisma.notification.create({
          data: {
            tenantId,
            userId: user.id,
            channel: "LINE",
            type,
            status: "SENT",
            referenceId,
            referenceType: type,
            sentAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.error(`Failed to push to user ${user.id}`, error);
        await this.prisma.notification.create({
          data: {
            tenantId,
            userId: user.id,
            channel: "LINE",
            type,
            status: "FAILED",
            referenceId,
            referenceType: type,
          },
        });
      }
    }
  }
}
