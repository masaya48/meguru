import { Test, TestingModule } from "@nestjs/testing";
import { AnswerService } from "./answer.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("AnswerService", () => {
  let service: AnswerService;
  let prisma: {
    circularAnswer: { upsert: jest.Mock; findMany: jest.Mock };
    circularQuestion: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      circularAnswer: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      circularQuestion: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AnswerService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AnswerService>(AnswerService);
  });

  describe("submit", () => {
    it("creates or updates an answer", async () => {
      prisma.circularQuestion.findUnique.mockResolvedValue({
        id: "q1",
        circular: { tenantId: "t1", status: "PUBLISHED" },
      });
      prisma.circularAnswer.upsert.mockResolvedValue({
        id: "a1",
        questionId: "q1",
        userId: "u1",
        answer: "参加する",
      });

      const result = await service.submit("t1", "u1", {
        questionId: "q1",
        answer: "参加する",
      });
      expect(result.answer).toBe("参加する");
    });

    it("throws if question not found", async () => {
      prisma.circularQuestion.findUnique.mockResolvedValue(null);
      await expect(service.submit("t1", "u1", { questionId: "q1", answer: "yes" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getByCircular", () => {
    it("returns answers grouped by question", async () => {
      prisma.circularAnswer.findMany.mockResolvedValue([
        { questionId: "q1", userId: "u1", answer: "参加する" },
      ]);
      const result = await service.getByCircular("c1");
      expect(result).toHaveLength(1);
    });
  });
});
