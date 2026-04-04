import { Test, TestingModule } from "@nestjs/testing";
import { NotificationService } from "./notification.service";
import { PrismaService } from "../prisma/prisma.service";
import { LineService } from "../line/line.service";

describe("NotificationService", () => {
  let service: NotificationService;
  let prisma: {
    user: { findMany: jest.Mock };
    notification: { create: jest.Mock; updateMany: jest.Mock };
    circular: { findUnique: jest.Mock };
    tenant: { findUnique: jest.Mock };
  };
  let lineService: { pushMessage: jest.Mock; getAppUrl: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findMany: jest.fn() },
      notification: { create: jest.fn(), updateMany: jest.fn() },
      circular: { findUnique: jest.fn() },
      tenant: { findUnique: jest.fn() },
    };
    lineService = {
      pushMessage: jest.fn().mockResolvedValue(undefined),
      getAppUrl: jest.fn().mockReturnValue("http://localhost:3000"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: LineService, useValue: lineService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe("notifyCircularPublished", () => {
    it("sends LINE notifications to connected users", async () => {
      prisma.circular.findUnique.mockResolvedValue({
        id: "c1",
        tenantId: "t1",
        title: "テスト回覧",
        type: "ATTENDANCE",
        targetType: "ALL",
        targetGroupIds: [],
        questions: [{ id: "q1", type: "YES_NO", options: ["参加", "不参加"] }],
      });
      prisma.tenant.findUnique.mockResolvedValue({ name: "テスト町内会" });
      prisma.user.findMany.mockResolvedValue([
        { id: "u1", lineUserId: "line-1" },
        { id: "u2", lineUserId: "line-2" },
      ]);
      prisma.notification.create.mockResolvedValue({ id: "n1" });

      await service.notifyCircularPublished("c1");

      expect(lineService.pushMessage).toHaveBeenCalledTimes(2);
      expect(prisma.notification.create).toHaveBeenCalledTimes(2);
    });

    it("skips users without LINE connection", async () => {
      prisma.circular.findUnique.mockResolvedValue({
        id: "c1",
        tenantId: "t1",
        title: "テスト",
        type: "NOTICE",
        targetType: "ALL",
        targetGroupIds: [],
        questions: [],
      });
      prisma.tenant.findUnique.mockResolvedValue({ name: "テスト" });
      prisma.user.findMany.mockResolvedValue([{ id: "u1", lineUserId: null }]);

      await service.notifyCircularPublished("c1");

      expect(lineService.pushMessage).not.toHaveBeenCalled();
    });
  });
});
