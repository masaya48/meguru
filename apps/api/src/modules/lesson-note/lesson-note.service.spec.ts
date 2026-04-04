import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { LessonNoteService } from "./lesson-note.service";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { LineService } from "../line/line.service";

describe("LessonNoteService", () => {
  let service: LessonNoteService;
  let prisma: {
    lessonNote: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let aiService: { generateLessonReport: jest.Mock };
  let lineService: { pushMessage: jest.Mock };

  const tenantId = "tenant-uuid-1";
  const noteId = "note-uuid-1";

  beforeEach(async () => {
    prisma = {
      lessonNote: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    aiService = { generateLessonReport: jest.fn() };
    lineService = { pushMessage: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonNoteService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: aiService },
        { provide: LineService, useValue: lineService },
      ],
    }).compile();

    service = module.get<LessonNoteService>(LessonNoteService);
  });

  describe("create", () => {
    it("creates a lesson note with DRAFT status", async () => {
      const dto = {
        lessonSessionId: "session-uuid-1",
        studentId: "student-uuid-1",
        teacherMemo: "今日は音階の練習をしました。",
      };
      const expected = { id: noteId, tenantId, ...dto, reportStatus: "DRAFT" };
      prisma.lessonNote.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);
      expect(result).toEqual(expected);
      expect(prisma.lessonNote.create).toHaveBeenCalledWith({
        data: {
          tenantId,
          lessonSessionId: dto.lessonSessionId,
          studentId: dto.studentId,
          teacherMemo: dto.teacherMemo,
          reportStatus: "DRAFT",
        },
      });
    });
  });

  describe("generateReport", () => {
    it("calls AiService and saves the generated report", async () => {
      const note = {
        id: noteId,
        tenantId,
        teacherMemo: "音階の練習",
        tenant: { genre: "MUSIC" },
        student: { name: "田中太郎" },
        lessonSession: { course: { name: "ピアノ初級" } },
      };
      prisma.lessonNote.findFirst.mockResolvedValue(note);
      aiService.generateLessonReport.mockResolvedValue("保護者向けレポート本文");
      const updated = { ...note, aiReport: "保護者向けレポート本文", reportStatus: "DRAFT" };
      prisma.lessonNote.update.mockResolvedValue(updated);

      const result = await service.generateReport(tenantId, noteId);
      expect(aiService.generateLessonReport).toHaveBeenCalledWith({
        teacherMemo: "音階の練習",
        studentName: "田中太郎",
        courseName: "ピアノ初級",
        genre: "MUSIC",
      });
      expect(prisma.lessonNote.update).toHaveBeenCalledWith({
        where: { id: noteId },
        data: { aiReport: "保護者向けレポート本文", reportStatus: "DRAFT" },
      });
      expect(result.aiReport).toBe("保護者向けレポート本文");
    });

    it("throws NotFoundException when note does not exist", async () => {
      prisma.lessonNote.findFirst.mockResolvedValue(null);

      await expect(service.generateReport(tenantId, "non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("edits the aiReport text", async () => {
      const note = { id: noteId, tenantId, aiReport: "旧レポート" };
      prisma.lessonNote.findFirst.mockResolvedValue(note);
      const updated = { ...note, aiReport: "修正後レポート" };
      prisma.lessonNote.update.mockResolvedValue(updated);

      const result = await service.update(tenantId, noteId, { aiReport: "修正後レポート" });
      expect(prisma.lessonNote.update).toHaveBeenCalledWith({
        where: { id: noteId },
        data: { aiReport: "修正後レポート" },
      });
      expect(result.aiReport).toBe("修正後レポート");
    });
  });

  describe("send", () => {
    it("sends LINE messages and updates status to SENT", async () => {
      const note = {
        id: noteId,
        tenantId,
        aiReport: "保護者向けレポート",
        teacherMemo: "メモ",
        student: {
          studentParents: [{ user: { lineUserId: "line-user-1" } }, { user: { lineUserId: null } }],
        },
      };
      prisma.lessonNote.findFirst.mockResolvedValue(note);
      lineService.pushMessage.mockResolvedValue(undefined);
      const updated = { ...note, reportStatus: "SENT", sentAt: new Date() };
      prisma.lessonNote.update.mockResolvedValue(updated);

      const result = await service.send(tenantId, noteId);
      expect(lineService.pushMessage).toHaveBeenCalledTimes(1);
      expect(lineService.pushMessage).toHaveBeenCalledWith("line-user-1", [
        { type: "text", text: "保護者向けレポート" },
      ]);
      expect(prisma.lessonNote.update).toHaveBeenCalledWith({
        where: { id: noteId },
        data: { reportStatus: "SENT", sentAt: expect.any(Date) },
      });
      expect(result.reportStatus).toBe("SENT");
    });
  });
});
