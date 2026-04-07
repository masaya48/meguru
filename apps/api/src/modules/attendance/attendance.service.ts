import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RecordAttendanceDto } from "./dto/record-attendance.dto";
import { AttendanceStatus } from "@meguru/db";

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async record(tenantId: string, dto: RecordAttendanceDto) {
    return this.prisma.attendance.upsert({
      where: { lessonSessionId: dto.lessonSessionId },
      create: { tenantId, ...dto },
      update: { status: dto.status, note: dto.note },
    });
  }

  async getStudentHistory(tenantId: string, studentId: string) {
    return this.prisma.attendance.findMany({
      where: { tenantId, studentId },
      include: {
        lessonSession: {
          include: { course: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getStudentStats(tenantId: string, studentId: string, year: number, month: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));
    const records = await this.prisma.attendance.findMany({
      where: {
        tenantId,
        studentId,
        lessonSession: { date: { gte: startDate, lt: endDate } },
      },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
    const late = records.filter((r) => r.status === AttendanceStatus.LATE).length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, rate };
  }

  async getSessionAttendance(tenantId: string, sessionId: string) {
    return this.prisma.attendance.findFirst({
      where: { tenantId, lessonSessionId: sessionId },
      include: { student: true },
    });
  }
}
