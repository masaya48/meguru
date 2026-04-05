import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { MonthlySummaryService } from "./monthly-summary.service";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { LineService } from "../line/line.service";
import { AttendanceService } from "../attendance/attendance.service";

describe("MonthlySummaryService", () => {
  let service: MonthlySummaryService;
  let prisma: {
    monthlySummary: {
      upsert: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    lessonNote: { findMany: jest.Mock };
    tenant: { findUnique: jest.Mock };
    student: { findFirst: jest.Mock };
    course: { findFirst: jest.Mock };
  };
  let aiService: { generateMonthlySummary: jest.Mock };
  let lineService: { pushMessage: jest.Mock };
  let attendanceService: { getStudentStats: jest.Mock };

  const tenantId = "tenant-uuid-1";
  const studentId = "student-uuid-1";
  const courseId = "course-uuid-1";
  const summaryId = "summary-uuid-1";
  const year = 2025;
  const month = 4;

  beforeEach(async () => {
    prisma = {
      monthlySummary: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      lessonNote: { findMany: jest.fn() },
      tenant: { findUnique: jest.fn() },
      student: { findFirst: jest.fn() },
      course: { findFirst: jest.fn() },
    };

    aiService = { generateMonthlySummary: jest.fn() };
    lineService = { pushMessage: jest.fn() };
    attendanceService = { getStudentStats: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonthlySummaryService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: aiService },
        { provide: LineService, useValue: lineService },
        { provide: AttendanceService, useValue: attendanceService },
      ],
    }).compile();

    service = module.get<MonthlySummaryService>(MonthlySummaryService);
  });

  describe("generate", () => {
    it("calls AI and saves the generated monthly summary", async () => {
      const stats = { total: 4, present: 3, absent: 1, late: 0, rate: 75 };
      attendanceService.getStudentStats.mockResolvedValue(stats);
      prisma.lessonNote.findMany.mockResolvedValue([
        { teacherMemo: "音階の練習" },
        { teacherMemo: "曲の練習" },
      ]);
      prisma.tenant.findUnique.mockResolvedValue({ id: tenantId, genre: "MUSIC" });
      prisma.student.findFirst.mockResolvedValue({ id: studentId, name: "田中太郎" });
      prisma.course.findFirst.mockResolvedValue({ id: courseId, name: "ピアノ初級" });
      aiService.generateMonthlySummary.mockResolvedValue("月次サマリー本文");
      const savedSummary = {
        id: summaryId,
        tenantId,
        studentId,
        courseId,
        year,
        month,
        aiSummary: "月次サマリー本文",
        reportStatus: "DRAFT",
      };
      prisma.monthlySummary.upsert.mockResolvedValue(savedSummary);

      const result = await service.generate(tenantId, studentId, courseId, year, month);

      expect(attendanceService.getStudentStats).toHaveBeenCalledWith(
        tenantId,
        studentId,
        year,
        month,
      );
      expect(aiService.generateMonthlySummary).toHaveBeenCalledWith({
        studentName: "田中太郎",
        courseName: "ピアノ初級",
        genre: "MUSIC",
        year,
        month,
        attendanceStats: stats,
        lessonMemos: ["音階の練習", "曲の練習"],
      });
      expect(prisma.monthlySummary.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ aiSummary: "月次サマリー本文", reportStatus: "DRAFT" }),
        }),
      );
      expect(result.aiSummary).toBe("月次サマリー本文");
    });
  });

  describe("findAll", () => {
    it("filters summaries by year and month", async () => {
      const summaries = [
        {
          id: summaryId,
          tenantId,
          year,
          month,
          student: { name: "田中太郎" },
          course: { name: "ピアノ初級" },
        },
      ];
      prisma.monthlySummary.findMany.mockResolvedValue(summaries);

      const result = await service.findAll(tenantId, year, month);

      expect(prisma.monthlySummary.findMany).toHaveBeenCalledWith({
        where: { tenantId, year, month },
        include: { student: true, course: true },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(summaries);
    });
  });

  describe("send", () => {
    it("sends LINE messages and updates reportStatus to SENT", async () => {
      const summary = {
        id: summaryId,
        tenantId,
        aiSummary: "AI生成サマリー",
        editedSummary: "編集済みサマリー",
        student: {
          studentParents: [{ user: { lineUserId: "line-user-1" } }, { user: { lineUserId: null } }],
        },
      };
      prisma.monthlySummary.findFirst.mockResolvedValue(summary);
      lineService.pushMessage.mockResolvedValue(undefined);
      const updated = { ...summary, reportStatus: "SENT", sentAt: new Date() };
      prisma.monthlySummary.update.mockResolvedValue(updated);

      const result = await service.send(tenantId, summaryId);

      expect(lineService.pushMessage).toHaveBeenCalledTimes(1);
      expect(lineService.pushMessage).toHaveBeenCalledWith("line-user-1", [
        { type: "text", text: "編集済みサマリー" },
      ]);
      expect(prisma.monthlySummary.update).toHaveBeenCalledWith({
        where: { id: summaryId },
        data: { reportStatus: "SENT", sentAt: expect.any(Date) },
      });
      expect(result.reportStatus).toBe("SENT");
    });

    it("throws NotFoundException when summary does not exist", async () => {
      prisma.monthlySummary.findFirst.mockResolvedValue(null);

      await expect(service.send(tenantId, "non-existent")).rejects.toThrow(NotFoundException);
    });
  });
});
