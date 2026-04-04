import { Test, TestingModule } from "@nestjs/testing";
import { CircularService } from "./circular.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

describe("CircularService", () => {
  let service: CircularService;
  let prisma: {
    circular: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    circularQuestion: { createMany: jest.Mock };
  };
  let notificationService: { notifyCircularPublished: jest.Mock };

  beforeEach(async () => {
    prisma = {
      circular: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      circularQuestion: { createMany: jest.fn() },
    };
    notificationService = {
      notifyCircularPublished: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CircularService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<CircularService>(CircularService);
  });

  describe("create", () => {
    it("creates a circular with questions", async () => {
      const dto = {
        title: "春の清掃",
        body: "清掃のお知らせ",
        type: "ATTENDANCE" as const,
        questions: [
          {
            questionText: "参加できますか？",
            type: "YES_NO" as const,
            options: ["参加", "不参加"],
          },
        ],
      };
      prisma.circular.create.mockResolvedValue({
        id: "c1",
        tenantId: "t1",
        ...dto,
        status: "DRAFT",
      });

      const result = await service.create("t1", "u1", dto);
      expect(result.id).toBe("c1");
      expect(prisma.circular.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: "t1",
            createdById: "u1",
            title: "春の清掃",
            status: "DRAFT",
          }),
        }),
      );
    });
  });

  describe("findByTenant", () => {
    it("returns circulars for tenant", async () => {
      prisma.circular.findMany.mockResolvedValue([
        { id: "c1", title: "Test", status: "PUBLISHED" },
      ]);
      const result = await service.findByTenant("t1");
      expect(result).toHaveLength(1);
    });
  });

  describe("publish", () => {
    it("publishes a draft circular", async () => {
      prisma.circular.findUnique.mockResolvedValue({
        id: "c1",
        tenantId: "t1",
        status: "DRAFT",
      });
      prisma.circular.update.mockResolvedValue({
        id: "c1",
        status: "PUBLISHED",
        publishedAt: new Date(),
      });

      const result = await service.publish("t1", "c1");
      expect(result.status).toBe("PUBLISHED");
    });

    it("throws if circular not found", async () => {
      prisma.circular.findUnique.mockResolvedValue(null);
      await expect(service.publish("t1", "c1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("close", () => {
    it("closes a published circular", async () => {
      prisma.circular.findUnique.mockResolvedValue({
        id: "c1",
        tenantId: "t1",
        status: "PUBLISHED",
      });
      prisma.circular.update.mockResolvedValue({
        id: "c1",
        status: "CLOSED",
        closedAt: new Date(),
      });

      const result = await service.close("t1", "c1");
      expect(result.status).toBe("CLOSED");
    });
  });
});
