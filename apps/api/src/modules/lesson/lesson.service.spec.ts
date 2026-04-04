import { Test, TestingModule } from "@nestjs/testing";
import { LessonService } from "./lesson.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("LessonService", () => {
  let service: LessonService;
  let prisma: {
    lessonSlot: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    lessonSession: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  const tenantId = "tenant-uuid-1";

  beforeEach(async () => {
    prisma = {
      lessonSlot: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      lessonSession: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<LessonService>(LessonService);
  });

  // ─── Slot CRUD ───────────────────────────────────────────

  describe("createSlot", () => {
    it("creates a lesson slot with tenantId", async () => {
      const dto = {
        courseId: "course-1",
        studentId: "student-1",
        dayOfWeek: "MON" as const,
        startTime: "10:00",
        endTime: "11:00",
      };
      const expected = { id: "slot-1", tenantId, ...dto };
      prisma.lessonSlot.create.mockResolvedValue(expected);

      const result = await service.createSlot(tenantId, dto);
      expect(result).toEqual(expected);
      expect(prisma.lessonSlot.create).toHaveBeenCalledWith({
        data: { tenantId, ...dto },
      });
    });
  });

  describe("findSlots", () => {
    it("lists active slots excluding soft-deleted", async () => {
      const slots = [{ id: "slot-1", tenantId, deletedAt: null }];
      prisma.lessonSlot.findMany.mockResolvedValue(slots);

      const result = await service.findSlots(tenantId);
      expect(result).toEqual(slots);
      expect(prisma.lessonSlot.findMany).toHaveBeenCalledWith({
        where: { tenantId, deletedAt: null },
        include: { student: true, course: true },
      });
    });
  });

  describe("deleteSlot", () => {
    it("soft deletes a slot by setting deletedAt", async () => {
      const slot = { id: "slot-1", tenantId, deletedAt: null };
      prisma.lessonSlot.findFirst.mockResolvedValue(slot);
      prisma.lessonSlot.update.mockResolvedValue({
        ...slot,
        deletedAt: new Date(),
      });

      const result = await service.deleteSlot(tenantId, "slot-1");
      expect(result.deletedAt).toBeTruthy();
      expect(prisma.lessonSlot.update).toHaveBeenCalledWith({
        where: { id: "slot-1" },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it("throws NotFoundException for non-existent slot", async () => {
      prisma.lessonSlot.findFirst.mockResolvedValue(null);

      await expect(service.deleteSlot(tenantId, "non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getDatesForDayOfWeek ────────────────────────────────

  describe("getDatesForDayOfWeek", () => {
    it("returns all Mondays in April 2026", () => {
      // April 2026: Mon = 6, 13, 20, 27
      const dates = service.getDatesForDayOfWeek(2026, 4, 1); // 1 = Monday
      expect(dates).toHaveLength(4);
      expect(dates[0].getUTCDate()).toBe(6);
      expect(dates[1].getUTCDate()).toBe(13);
      expect(dates[2].getUTCDate()).toBe(20);
      expect(dates[3].getUTCDate()).toBe(27);
      // All should be in April (month index 3)
      for (const d of dates) {
        expect(d.getUTCMonth()).toBe(3);
        expect(d.getUTCFullYear()).toBe(2026);
      }
    });

    it("returns all Sundays in February 2026", () => {
      // February 2026: Sun = 1, 8, 15, 22
      const dates = service.getDatesForDayOfWeek(2026, 2, 0); // 0 = Sunday
      expect(dates).toHaveLength(4);
      expect(dates[0].getUTCDate()).toBe(1);
      expect(dates[3].getUTCDate()).toBe(22);
    });

    it("returns 5 Fridays for January 2027", () => {
      // January 2027: Fri = 1, 8, 15, 22, 29
      const dates = service.getDatesForDayOfWeek(2027, 1, 5); // 5 = Friday
      expect(dates).toHaveLength(5);
    });
  });

  // ─── generateSessions ───────────────────────────────────

  describe("generateSessions", () => {
    it("generates correct number of sessions for a month", async () => {
      const slot = {
        id: "slot-1",
        tenantId,
        studentId: "student-1",
        courseId: "course-1",
        dayOfWeek: "MON",
        startTime: "10:00",
        endTime: "11:00",
      };
      prisma.lessonSlot.findMany.mockResolvedValue([slot]);
      prisma.lessonSession.findFirst.mockResolvedValue(null); // no existing
      prisma.lessonSession.create.mockResolvedValue({});

      const result = await service.generateSessions(tenantId, {
        year: 2026,
        month: 4,
      });

      // April 2026 has 4 Mondays
      expect(result.created).toBe(4);
      expect(result.skipped).toBe(0);
      expect(prisma.lessonSession.create).toHaveBeenCalledTimes(4);
    });

    it("is idempotent — running twice creates no duplicates", async () => {
      const slot = {
        id: "slot-1",
        tenantId,
        studentId: "student-1",
        courseId: "course-1",
        dayOfWeek: "MON",
        startTime: "10:00",
        endTime: "11:00",
      };
      prisma.lessonSlot.findMany.mockResolvedValue([slot]);
      // All sessions already exist
      prisma.lessonSession.findFirst.mockResolvedValue({ id: "existing" });

      const result = await service.generateSessions(tenantId, {
        year: 2026,
        month: 4,
      });

      expect(result.created).toBe(0);
      expect(result.skipped).toBe(4);
      expect(prisma.lessonSession.create).not.toHaveBeenCalled();
    });

    it("only processes active slots (deletedAt: null)", async () => {
      prisma.lessonSlot.findMany.mockResolvedValue([]); // query already filters

      const result = await service.generateSessions(tenantId, {
        year: 2026,
        month: 4,
      });

      expect(result.created).toBe(0);
      expect(result.skipped).toBe(0);
      expect(prisma.lessonSlot.findMany).toHaveBeenCalledWith({
        where: { tenantId, deletedAt: null },
      });
    });
  });
});
