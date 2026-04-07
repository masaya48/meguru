import { Test, TestingModule } from "@nestjs/testing";
import { AbsenceService } from "./absence.service";
import { PrismaService } from "../prisma/prisma.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("AbsenceService", () => {
  let service: AbsenceService;
  let prisma: {
    lessonSession: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    attendance: {
      upsert: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const tenantId = "tenant-uuid-1";
  const userId = "user-uuid-1";
  const sessionId = "session-uuid-1";
  const studentId = "student-uuid-1";

  beforeEach(async () => {
    prisma = {
      lessonSession: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      attendance: {
        upsert: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AbsenceService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AbsenceService>(AbsenceService);
  });

  describe("create", () => {
    it("cancels session and creates ABSENT attendance record", async () => {
      const session = {
        id: sessionId,
        tenantId,
        studentId,
        status: "SCHEDULED",
      };
      const updatedSession = { ...session, status: "CANCELLED" };
      const attendance = {
        id: "attendance-uuid-1",
        tenantId,
        lessonSessionId: sessionId,
        studentId,
        status: "ABSENT",
      };

      prisma.lessonSession.findFirst.mockResolvedValue(session);
      prisma.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops));
      prisma.lessonSession.update.mockResolvedValue(updatedSession);
      prisma.attendance.upsert.mockResolvedValue(attendance);

      const dto = { lessonSessionId: sessionId };
      const result = await service.create(tenantId, userId, dto);

      expect(result.status).toBe("CANCELLED");
      expect(prisma.lessonSession.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: { status: "CANCELLED" },
      });
      expect(prisma.attendance.upsert).toHaveBeenCalledWith({
        where: { lessonSessionId: sessionId },
        create: {
          tenantId,
          lessonSessionId: sessionId,
          studentId,
          status: "ABSENT",
        },
        update: {
          status: "ABSENT",
        },
      });
    });

    it("throws NotFoundException when session not found", async () => {
      prisma.lessonSession.findFirst.mockResolvedValue(null);

      const dto = { lessonSessionId: "non-existent-uuid" };
      await expect(service.create(tenantId, userId, dto)).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("throws BadRequestException when session is not SCHEDULED", async () => {
      const session = {
        id: sessionId,
        tenantId,
        studentId,
        status: "CANCELLED",
      };
      prisma.lessonSession.findFirst.mockResolvedValue(session);

      const dto = { lessonSessionId: sessionId };
      await expect(service.create(tenantId, userId, dto)).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
