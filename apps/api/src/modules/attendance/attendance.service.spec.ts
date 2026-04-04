import { Test, TestingModule } from "@nestjs/testing";
import { AttendanceService } from "./attendance.service";
import { PrismaService } from "../prisma/prisma.service";
import { AttendanceStatus } from "@meguru/db";

describe("AttendanceService", () => {
  let service: AttendanceService;
  let prisma: {
    attendance: {
      upsert: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
    };
  };

  const tenantId = "tenant-uuid-1";
  const studentId = "student-uuid-1";
  const sessionId = "session-uuid-1";

  beforeEach(async () => {
    prisma = {
      attendance: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  describe("record", () => {
    it("creates attendance via upsert", async () => {
      const dto = {
        lessonSessionId: sessionId,
        studentId,
        status: AttendanceStatus.PRESENT,
        note: "元気でした",
      };
      const expected = { id: "att-uuid-1", tenantId, ...dto };
      prisma.attendance.upsert.mockResolvedValue(expected);

      const result = await service.record(tenantId, dto);
      expect(result).toEqual(expected);
      expect(prisma.attendance.upsert).toHaveBeenCalledWith({
        where: { lessonSessionId: sessionId },
        create: { tenantId, ...dto },
        update: { status: AttendanceStatus.PRESENT, note: "元気でした" },
      });
    });
  });

  describe("getStudentStats", () => {
    it("calculates attendance rate correctly", async () => {
      const records = [
        { id: "1", status: AttendanceStatus.PRESENT },
        { id: "2", status: AttendanceStatus.PRESENT },
        { id: "3", status: AttendanceStatus.ABSENT },
        { id: "4", status: AttendanceStatus.LATE },
      ];
      prisma.attendance.findMany.mockResolvedValue(records);

      const result = await service.getStudentStats(tenantId, studentId, 2026, 4);
      expect(result).toEqual({ total: 4, present: 2, absent: 1, late: 1, rate: 50 });
    });
  });

  describe("getStudentHistory", () => {
    it("returns records ordered by createdAt desc", async () => {
      const records = [
        { id: "att-2", createdAt: new Date("2026-04-02") },
        { id: "att-1", createdAt: new Date("2026-04-01") },
      ];
      prisma.attendance.findMany.mockResolvedValue(records);

      const result = await service.getStudentHistory(tenantId, studentId);
      expect(result).toEqual(records);
      expect(prisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, studentId },
          orderBy: { createdAt: "desc" },
        }),
      );
    });
  });

  describe("getSessionAttendance", () => {
    it("returns null for missing attendance", async () => {
      prisma.attendance.findFirst.mockResolvedValue(null);

      const result = await service.getSessionAttendance(tenantId, "non-existent-session");
      expect(result).toBeNull();
    });
  });
});
