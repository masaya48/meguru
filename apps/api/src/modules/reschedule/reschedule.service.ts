import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RescheduleStatus } from "@meguru/db";
import { CreateRescheduleDto } from "./dto/create-reschedule.dto";

@Injectable()
export class RescheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateRescheduleDto) {
    const session = await this.prisma.lessonSession.findFirst({
      where: { id: dto.originalSessionId, tenantId },
      include: { course: true },
    });
    if (!session) throw new NotFoundException("Lesson session not found");

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const count = await this.prisma.rescheduleRequest.count({
      where: {
        studentId: dto.studentId,
        status: "APPROVED",
        createdAt: { gte: monthStart, lt: nextMonthStart },
      },
    });

    const maxMonthlyReschedules = session.course.maxMonthlyReschedules ?? 0;
    if (count >= maxMonthlyReschedules) {
      throw new BadRequestException(
        `Monthly reschedule limit of ${maxMonthlyReschedules} has been reached`,
      );
    }

    return this.prisma.rescheduleRequest.create({
      data: {
        tenantId,
        originalSessionId: dto.originalSessionId,
        studentId: dto.studentId,
        requestedById: userId,
        status: RescheduleStatus.PENDING,
      },
    });
  }

  async findAll(tenantId: string, status?: RescheduleStatus) {
    return this.prisma.rescheduleRequest.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
      },
      include: {
        originalSession: {
          include: { student: true, course: true },
        },
        requestedSession: true,
        requestedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async approve(tenantId: string, requestId: string, requestedSessionId: string) {
    const request = await this.prisma.rescheduleRequest.findFirst({
      where: { id: requestId, tenantId },
    });
    if (!request) throw new NotFoundException("Reschedule request not found");

    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.rescheduleRequest.update({
        where: { id: requestId },
        data: { status: RescheduleStatus.APPROVED, requestedSessionId },
      }),
      this.prisma.lessonSession.update({
        where: { id: request.originalSessionId },
        data: { status: "RESCHEDULED" },
      }),
    ]);

    return updatedRequest;
  }

  async reject(tenantId: string, requestId: string) {
    const request = await this.prisma.rescheduleRequest.findFirst({
      where: { id: requestId, tenantId },
    });
    if (!request) throw new NotFoundException("Reschedule request not found");

    return this.prisma.rescheduleRequest.update({
      where: { id: requestId },
      data: { status: RescheduleStatus.REJECTED },
    });
  }
}
