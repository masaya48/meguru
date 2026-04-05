import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { LineService } from "../line/line.service";
import { AttendanceService } from "../attendance/attendance.service";

@Injectable()
export class MonthlySummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly lineService: LineService,
    private readonly attendanceService: AttendanceService,
  ) {}

  async generate(
    tenantId: string,
    studentId: string,
    courseId: string,
    year: number,
    month: number,
  ) {
    const attendanceStats = await this.attendanceService.getStudentStats(
      tenantId,
      studentId,
      year,
      month,
    );

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const lessonNotes = await this.prisma.lessonNote.findMany({
      where: {
        tenantId,
        studentId,
        lessonSession: {
          courseId,
          date: { gte: startDate, lt: endDate },
        },
      },
      include: { lessonSession: true },
      orderBy: { createdAt: "asc" },
    });

    const [tenant, student, course] = await Promise.all([
      this.prisma.tenant.findUnique({ where: { id: tenantId } }),
      this.prisma.student.findFirst({ where: { id: studentId, tenantId } }),
      this.prisma.course.findFirst({ where: { id: courseId, tenantId } }),
    ]);

    if (!tenant) throw new NotFoundException("Tenant not found");
    if (!student) throw new NotFoundException("Student not found");
    if (!course) throw new NotFoundException("Course not found");

    const aiSummary = await this.aiService.generateMonthlySummary({
      studentName: student.name,
      courseName: course.name,
      genre: tenant.genre,
      year,
      month,
      attendanceStats,
      lessonMemos: lessonNotes.map((n) => n.teacherMemo),
    });

    return this.prisma.monthlySummary.upsert({
      where: {
        tenantId_studentId_courseId_year_month: {
          tenantId,
          studentId,
          courseId,
          year,
          month,
        },
      },
      create: {
        tenantId,
        studentId,
        courseId,
        year,
        month,
        aiSummary,
        reportStatus: "DRAFT",
      },
      update: {
        aiSummary,
        editedSummary: null,
        reportStatus: "DRAFT",
      },
    });
  }

  async findAll(tenantId: string, year: number, month: number) {
    return this.prisma.monthlySummary.findMany({
      where: { tenantId, year, month },
      include: {
        student: true,
        course: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(tenantId: string, summaryId: string, editedSummary: string) {
    const summary = await this.prisma.monthlySummary.findFirst({
      where: { id: summaryId, tenantId },
    });
    if (!summary) throw new NotFoundException("MonthlySummary not found");

    return this.prisma.monthlySummary.update({
      where: { id: summaryId },
      data: { editedSummary },
    });
  }

  async send(tenantId: string, summaryId: string) {
    const summary = await this.prisma.monthlySummary.findFirst({
      where: { id: summaryId, tenantId },
      include: {
        student: {
          include: {
            studentParents: {
              include: { user: true },
            },
          },
        },
      },
    });
    if (!summary) throw new NotFoundException("MonthlySummary not found");

    const messageText = summary.editedSummary ?? summary.aiSummary;
    const parentsWithLine = summary.student.studentParents.filter(
      (sp) => sp.user.lineUserId !== null,
    );

    await Promise.all(
      parentsWithLine.map((sp) =>
        this.lineService.pushMessage(sp.user.lineUserId as string, [
          { type: "text", text: messageText },
        ]),
      ),
    );

    return this.prisma.monthlySummary.update({
      where: { id: summaryId },
      data: { reportStatus: "SENT", sentAt: new Date() },
    });
  }
}
