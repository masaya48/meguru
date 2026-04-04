import { Test, TestingModule } from "@nestjs/testing";
import { PaymentService } from "./payment.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { PaymentStatus } from "@prisma/client";

describe("PaymentService", () => {
  let service: PaymentService;
  let prisma: {
    studentCourse: {
      findMany: jest.Mock;
    };
    payment: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const tenantId = "tenant-uuid-1";

  beforeEach(async () => {
    prisma = {
      studentCourse: {
        findMany: jest.fn(),
      },
      payment: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe("generate", () => {
    it("creates payments from studentCourses", async () => {
      const studentCourses = [
        {
          studentId: "student-1",
          courseId: "course-1",
          course: { monthlyFee: 5000 },
        },
        {
          studentId: "student-2",
          courseId: "course-1",
          course: { monthlyFee: 5000 },
        },
      ];

      prisma.studentCourse.findMany.mockResolvedValue(studentCourses);
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue({});

      const result = await service.generate(tenantId, { year: 2024, month: 4 });

      expect(result).toEqual({ created: 2, skipped: 0 });
      expect(prisma.payment.create).toHaveBeenCalledTimes(2);
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          tenantId,
          studentId: "student-1",
          courseId: "course-1",
          year: 2024,
          month: 4,
          amount: 5000,
          status: PaymentStatus.UNPAID,
        },
      });
    });

    it("is idempotent - skips existing payments", async () => {
      const studentCourses = [
        {
          studentId: "student-1",
          courseId: "course-1",
          course: { monthlyFee: 5000 },
        },
      ];

      prisma.studentCourse.findMany.mockResolvedValue(studentCourses);
      prisma.payment.findFirst.mockResolvedValue({
        id: "payment-1",
        studentId: "student-1",
        courseId: "course-1",
        year: 2024,
        month: 4,
      });

      const result = await service.generate(tenantId, { year: 2024, month: 4 });

      expect(result).toEqual({ created: 0, skipped: 1 });
      expect(prisma.payment.create).not.toHaveBeenCalled();
    });
  });

  describe("markPaid", () => {
    it("sets status to PAID and sets paidAt", async () => {
      const payment = { id: "payment-1", tenantId, status: PaymentStatus.UNPAID };
      prisma.payment.findFirst.mockResolvedValue(payment);
      const now = new Date();
      prisma.payment.update.mockResolvedValue({
        ...payment,
        status: PaymentStatus.PAID,
        paidAt: now,
      });

      const result = await service.markPaid(tenantId, "payment-1");

      expect(result.status).toBe(PaymentStatus.PAID);
      expect(result.paidAt).toBeTruthy();
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: "payment-1" },
        data: {
          status: PaymentStatus.PAID,
          paidAt: expect.any(Date),
        },
      });
    });

    it("throws NotFoundException for non-existent payment", async () => {
      prisma.payment.findFirst.mockResolvedValue(null);

      await expect(service.markPaid(tenantId, "non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getSummary", () => {
    it("calculates summary correctly", async () => {
      const payments = [
        { status: PaymentStatus.PAID, amount: 5000 },
        { status: PaymentStatus.PAID, amount: 3000 },
        { status: PaymentStatus.UNPAID, amount: 4000 },
        { status: PaymentStatus.OVERDUE, amount: 2000 },
      ];

      prisma.payment.findMany.mockResolvedValue(payments);

      const result = await service.getSummary(tenantId, 2024, 4);

      expect(result).toEqual({
        total: 4,
        paid: 2,
        unpaid: 1,
        overdue: 1,
        totalAmount: 14000,
        paidAmount: 8000,
      });
    });
  });
});
