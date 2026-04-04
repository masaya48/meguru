import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLessonSlotDto } from "./dto/create-lesson-slot.dto";
import { UpdateLessonSlotDto } from "./dto/update-lesson-slot.dto";
import { GenerateSessionsDto } from "./dto/generate-sessions.dto";
import { CreateSessionDto } from "./dto/create-session.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Slot CRUD ───────────────────────────────────────────

  async createSlot(tenantId: string, dto: CreateLessonSlotDto) {
    return this.prisma.lessonSlot.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        studentId: dto.studentId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async findSlots(tenantId: string) {
    return this.prisma.lessonSlot.findMany({
      where: { tenantId, deletedAt: null },
      include: { student: true, course: true },
    });
  }

  async updateSlot(tenantId: string, id: string, dto: UpdateLessonSlotDto) {
    const slot = await this.prisma.lessonSlot.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!slot) throw new NotFoundException("Lesson slot not found");

    return this.prisma.lessonSlot.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSlot(tenantId: string, id: string) {
    const slot = await this.prisma.lessonSlot.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!slot) throw new NotFoundException("Lesson slot not found");

    return this.prisma.lessonSlot.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Session Generation ──────────────────────────────────

  async generateSessions(tenantId: string, dto: GenerateSessionsDto) {
    const slots = await this.prisma.lessonSlot.findMany({
      where: { tenantId, deletedAt: null },
    });

    const dayMap: Record<string, number> = {
      SUN: 0,
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
      SAT: 6,
    };

    let created = 0;
    let skipped = 0;

    for (const slot of slots) {
      const dates = this.getDatesForDayOfWeek(dto.year, dto.month, dayMap[slot.dayOfWeek]);

      for (const date of dates) {
        const existing = await this.prisma.lessonSession.findFirst({
          where: { lessonSlotId: slot.id, date },
        });
        if (existing) {
          skipped++;
          continue;
        }

        await this.prisma.lessonSession.create({
          data: {
            tenantId,
            lessonSlotId: slot.id,
            studentId: slot.studentId,
            courseId: slot.courseId,
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: "SCHEDULED",
          },
        });
        created++;
      }
    }

    return { created, skipped };
  }

  getDatesForDayOfWeek(year: number, month: number, dayOfWeek: number): Date[] {
    const dates: Date[] = [];
    const date = new Date(Date.UTC(year, month - 1, 1));
    while (date.getUTCDay() !== dayOfWeek) {
      date.setUTCDate(date.getUTCDate() + 1);
    }
    while (date.getUTCMonth() === month - 1) {
      dates.push(new Date(date));
      date.setUTCDate(date.getUTCDate() + 7);
    }
    return dates;
  }

  // ─── Session Queries ─────────────────────────────────────

  async findWeekly(tenantId: string, date: Date) {
    const day = date.getUTCDay();
    const monday = new Date(date);
    monday.setUTCDate(date.getUTCDate() - ((day + 6) % 7));
    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 7);

    return this.prisma.lessonSession.findMany({
      where: {
        tenantId,
        date: { gte: monday, lt: sunday },
      },
      include: { student: true, course: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  async findDaily(tenantId: string, date: Date) {
    return this.prisma.lessonSession.findMany({
      where: { tenantId, date },
      include: {
        student: true,
        course: true,
        attendance: true,
        lessonNote: true,
      },
      orderBy: { startTime: "asc" },
    });
  }

  async findAvailableSlots(
    tenantId: string,
    courseId: string | undefined,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.lessonSession.findMany({
      where: {
        tenantId,
        status: "SCHEDULED",
        attendance: null,
        date: { gte: startDate, lte: endDate },
        ...(courseId ? { courseId } : {}),
      },
      include: { student: true, course: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  // ─── Session CRUD ────────────────────────────────────────

  async getSession(tenantId: string, id: string) {
    const session = await this.prisma.lessonSession.findFirst({
      where: { id, tenantId },
      include: {
        student: true,
        course: true,
        attendance: true,
        lessonNote: true,
        lessonSlot: true,
      },
    });
    if (!session) throw new NotFoundException("Lesson session not found");
    return session;
  }

  async updateSession(tenantId: string, id: string, dto: UpdateSessionDto) {
    await this.getSession(tenantId, id);
    return this.prisma.lessonSession.update({
      where: { id },
      data: dto,
    });
  }

  async createAdHocSession(tenantId: string, dto: CreateSessionDto) {
    return this.prisma.lessonSession.create({
      data: {
        tenantId,
        lessonSlotId: null,
        studentId: dto.studentId,
        courseId: dto.courseId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        status: "SCHEDULED",
      },
    });
  }
}
