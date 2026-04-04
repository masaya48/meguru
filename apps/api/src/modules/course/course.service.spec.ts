import { Test, TestingModule } from "@nestjs/testing";
import { CourseService } from "./course.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("CourseService", () => {
  let service: CourseService;
  let prisma: {
    course: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  const tenantId = "tenant-uuid-1";

  beforeEach(async () => {
    prisma = {
      course: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  describe("create", () => {
    it("creates a course with tenantId", async () => {
      const dto = { name: "ピアノ基礎", monthlyFee: 10000 };
      const expected = {
        id: "uuid-1",
        tenantId,
        ...dto,
        maxMonthlyReschedules: 2,
        deletedAt: null,
      };
      prisma.course.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);
      expect(result).toEqual(expected);
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: { tenantId, name: "ピアノ基礎", monthlyFee: 10000 },
      });
    });
  });

  describe("findAll", () => {
    it("lists courses excluding soft-deleted", async () => {
      const courses = [
        { id: "uuid-1", tenantId, name: "ピアノ基礎", monthlyFee: 10000, deletedAt: null },
      ];
      prisma.course.findMany.mockResolvedValue(courses);

      const result = await service.findAll(tenantId);
      expect(result).toEqual(courses);
      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: { tenantId, deletedAt: null },
      });
    });
  });

  describe("findById", () => {
    it("throws NotFoundException for non-existent course", async () => {
      prisma.course.findFirst.mockResolvedValue(null);

      await expect(service.findById(tenantId, "non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("soft deletes a course by setting deletedAt", async () => {
      const course = {
        id: "uuid-1",
        tenantId,
        name: "ピアノ基礎",
        monthlyFee: 10000,
        deletedAt: null,
      };
      prisma.course.findFirst.mockResolvedValue(course);
      const now = new Date();
      const deleted = { ...course, deletedAt: now };
      prisma.course.update.mockResolvedValue(deleted);

      const result = await service.delete(tenantId, "uuid-1");
      expect(result.deletedAt).toBeTruthy();
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
