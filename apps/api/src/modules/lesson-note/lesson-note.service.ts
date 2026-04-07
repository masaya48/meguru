import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { LineService } from "../line/line.service";
import { CreateLessonNoteDto } from "./dto/create-lesson-note.dto";
import { UpdateLessonNoteDto } from "./dto/update-lesson-note.dto";

@Injectable()
export class LessonNoteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly lineService: LineService,
  ) {}

  async create(tenantId: string, dto: CreateLessonNoteDto) {
    return this.prisma.lessonNote.create({
      data: {
        tenantId,
        lessonSessionId: dto.lessonSessionId,
        studentId: dto.studentId,
        teacherMemo: dto.teacherMemo,
        reportStatus: "DRAFT",
      },
    });
  }

  async findByStudent(tenantId: string, studentId: string) {
    return this.prisma.lessonNote.findMany({
      where: { tenantId, studentId },
      include: {
        lessonSession: {
          include: { course: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async generateReport(tenantId: string, noteId: string) {
    const note = await this.prisma.lessonNote.findFirst({
      where: { id: noteId, tenantId },
      include: {
        tenant: true,
        student: true,
        lessonSession: {
          include: { course: true },
        },
      },
    });
    if (!note) throw new NotFoundException("LessonNote not found");

    const aiReport = await this.aiService.generateLessonReport({
      teacherMemo: note.teacherMemo,
      studentName: note.student.name,
      courseName: note.lessonSession.course.name,
      genre: note.tenant.genre,
    });

    return this.prisma.lessonNote.update({
      where: { id: noteId },
      data: { aiReport, reportStatus: "DRAFT" },
    });
  }

  async update(tenantId: string, noteId: string, dto: UpdateLessonNoteDto) {
    const note = await this.prisma.lessonNote.findFirst({
      where: { id: noteId, tenantId },
    });
    if (!note) throw new NotFoundException("LessonNote not found");

    return this.prisma.lessonNote.update({
      where: { id: noteId },
      data: { aiReport: dto.aiReport },
    });
  }

  async send(tenantId: string, noteId: string) {
    const note = await this.prisma.lessonNote.findFirst({
      where: { id: noteId, tenantId },
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
    if (!note) throw new NotFoundException("LessonNote not found");

    const reportText = note.aiReport ?? note.teacherMemo;
    const parentsWithLine = note.student.studentParents.filter((sp) => sp.user.lineUserId !== null);

    await Promise.all(
      parentsWithLine.map((sp) =>
        this.lineService.pushMessage(sp.user.lineUserId as string, [
          { type: "text", text: reportText },
        ]),
      ),
    );

    return this.prisma.lessonNote.update({
      where: { id: noteId },
      data: { reportStatus: "SENT", sentAt: new Date() },
    });
  }
}
