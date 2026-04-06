import { Test, TestingModule } from "@nestjs/testing";
import { RescheduleService } from "./reschedule.service";
import { PrismaService } from "../prisma/prisma.service";
import { BadRequestException } from "@nestjs/common";
import { RescheduleStatus } from "@meguru/db";

describe("RescheduleService", () => {
  let service: RescheduleService;
  let prisma: {
    lessonSession: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    rescheduleRequest: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const tenantId = "tenant-uuid-1";
  const userId = "user-uuid-1";
  const studentId = "student-uuid-1";
  const sessionId = "session-uuid-1";
  const requestId = "request-uuid-1";

  beforeEach(async () => {
    prisma = {
      lessonSession: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      rescheduleRequest: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RescheduleService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<RescheduleService>(RescheduleService);
  });

  describe("create", () => {
    it("creates a reschedule request when within monthly limit", async () => {
      const session = {
        id: sessionId,
        tenantId,
        course: { maxMonthlyReschedules: 2 },
      };
      const dto = { originalSessionId: sessionId, studentId };
      const expected = {
        id: requestId,
        tenantId,
        originalSessionId: sessionId,
        studentId,
        requestedById: userId,
        status: RescheduleStatus.PENDING,
      };

      prisma.lessonSession.findFirst.mockResolvedValue(session);
      prisma.rescheduleRequest.count.mockResolvedValue(1); // 1 approved, limit is 2
      prisma.rescheduleRequest.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, userId, dto);
      expect(result).toEqual(expected);
      expect(prisma.rescheduleRequest.create).toHaveBeenCalledWith({
        data: {
          tenantId,
          originalSessionId: sessionId,
          studentId,
          requestedById: userId,
          status: RescheduleStatus.PENDING,
        },
      });
    });

    it("throws BadRequestException when monthly limit is exceeded", async () => {
      const session = {
        id: sessionId,
        tenantId,
        course: { maxMonthlyReschedules: 2 },
      };
      const dto = { originalSessionId: sessionId, studentId };

      prisma.lessonSession.findFirst.mockResolvedValue(session);
      prisma.rescheduleRequest.count.mockResolvedValue(2); // already at limit

      await expect(service.create(tenantId, userId, dto)).rejects.toThrow(BadRequestException);
      expect(prisma.rescheduleRequest.create).not.toHaveBeenCalled();
    });
  });

  describe("approve", () => {
    it("updates both the request status and the original session status", async () => {
      const request = {
        id: requestId,
        tenantId,
        originalSessionId: sessionId,
        status: RescheduleStatus.PENDING,
      };
      const requestedSessionId = "new-session-uuid-1";
      const updatedRequest = { ...request, status: RescheduleStatus.APPROVED, requestedSessionId };

      prisma.rescheduleRequest.findFirst.mockResolvedValue(request);
      prisma.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops));
      prisma.rescheduleRequest.update.mockResolvedValue(updatedRequest);
      prisma.lessonSession.update.mockResolvedValue({ id: sessionId, status: "RESCHEDULED" });

      const result = await service.approve(tenantId, requestId, requestedSessionId);

      expect(result.status).toBe(RescheduleStatus.APPROVED);
      expect(prisma.rescheduleRequest.update).toHaveBeenCalledWith({
        where: { id: requestId },
        data: { status: RescheduleStatus.APPROVED, requestedSessionId },
      });
      expect(prisma.lessonSession.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: { status: "RESCHEDULED" },
      });
    });
  });

  describe("reject", () => {
    it("updates the request status to REJECTED", async () => {
      const request = {
        id: requestId,
        tenantId,
        originalSessionId: sessionId,
        status: RescheduleStatus.PENDING,
      };
      const rejectedRequest = { ...request, status: RescheduleStatus.REJECTED };

      prisma.rescheduleRequest.findFirst.mockResolvedValue(request);
      prisma.rescheduleRequest.update.mockResolvedValue(rejectedRequest);

      const result = await service.reject(tenantId, requestId);

      expect(result.status).toBe(RescheduleStatus.REJECTED);
      expect(prisma.rescheduleRequest.update).toHaveBeenCalledWith({
        where: { id: requestId },
        data: { status: RescheduleStatus.REJECTED },
      });
    });
  });
});
