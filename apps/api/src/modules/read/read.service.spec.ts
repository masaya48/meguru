import { Test, TestingModule } from "@nestjs/testing";
import { ReadService } from "./read.service";
import { PrismaService } from "../prisma/prisma.service";

describe("ReadService", () => {
  let service: ReadService;
  let prisma: {
    circularRead: {
      upsert: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
    circular: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      circularRead: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      circular: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ReadService>(ReadService);
  });

  describe("markAsRead", () => {
    it("creates a read record (idempotent via upsert)", async () => {
      prisma.circular.findUnique.mockResolvedValue({
        id: "c1",
        tenantId: "t1",
        status: "PUBLISHED",
      });
      prisma.circularRead.upsert.mockResolvedValue({
        id: "r1",
        circularId: "c1",
        userId: "u1",
      });

      const result = await service.markAsRead("t1", "c1", "u1");
      expect(result.circularId).toBe("c1");
    });
  });

  describe("getReadStatus", () => {
    it("returns read users for a circular", async () => {
      prisma.circular.findUnique.mockResolvedValue({
        id: "c1",
        tenantId: "t1",
      });
      prisma.circularRead.findMany.mockResolvedValue([
        { userId: "u1", readAt: new Date(), user: { id: "u1", name: "太郎" } },
      ]);

      const result = await service.getReadStatus("t1", "c1");
      expect(result).toHaveLength(1);
    });
  });
});
