import { Test, TestingModule } from "@nestjs/testing";
import { NotificationService } from "./notification.service";
import { PrismaService } from "../prisma/prisma.service";
import { LineService } from "../line/line.service";

describe("NotificationService", () => {
  let service: NotificationService;
  let prisma: Record<string, any>;
  let lineService: { pushMessage: jest.Mock; getAppUrl: jest.Mock };

  beforeEach(async () => {
    prisma = {
      lessonNote: { findUnique: jest.fn() },
      lessonSession: { findUnique: jest.fn() },
      rescheduleRequest: { findUnique: jest.fn() },
      payment: { findUnique: jest.fn() },
      studentParent: { findMany: jest.fn() },
      notification: { create: jest.fn() },
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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("sendLessonReminder", () => {
    it("sends reminder to parents with LINE", async () => {
      prisma.lessonSession.findUnique.mockResolvedValue({
        id: "s1",
        tenantId: "t1",
        date: new Date(),
        startTime: "16:00",
        student: {
          id: "st1",
          name: "田中太郎",
          studentParents: [{ user: { id: "u1", lineUserId: "line-1" } }],
        },
        course: { name: "ピアノ初級" },
      });
      prisma.notification.create.mockResolvedValue({ id: "n1" });

      await service.sendLessonReminder("s1");

      expect(lineService.pushMessage).toHaveBeenCalledTimes(1);
    });

    it("skips parents without LINE", async () => {
      prisma.lessonSession.findUnique.mockResolvedValue({
        id: "s1",
        tenantId: "t1",
        date: new Date(),
        startTime: "16:00",
        student: {
          id: "st1",
          name: "田中太郎",
          studentParents: [{ user: { id: "u1", lineUserId: null } }],
        },
        course: { name: "ピアノ初級" },
      });

      await service.sendLessonReminder("s1");

      expect(lineService.pushMessage).not.toHaveBeenCalled();
    });
  });
});
