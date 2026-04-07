import { Test, TestingModule } from "@nestjs/testing";
import { StudentService } from "./student.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("StudentService", () => {
  let service: StudentService;
  let prisma: {
    student: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    studentParent: {
      create: jest.Mock;
      delete: jest.Mock;
    };
    studentCourse: {
      create: jest.Mock;
      delete: jest.Mock;
    };
  };

  const tenantId = "tenant-uuid-1";

  beforeEach(async () => {
    prisma = {
      student: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      studentParent: {
        create: jest.fn(),
        delete: jest.fn(),
      },
      studentCourse: {
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  describe("create", () => {
    it("creates a student with tenantId", async () => {
      const dto = { name: "田中太郎", notes: "備考" };
      const expected = { id: "uuid-1", tenantId, ...dto };
      prisma.student.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);
      expect(result).toEqual(expected);
      expect(prisma.student.create).toHaveBeenCalledWith({
        data: { tenantId, name: "田中太郎", notes: "備考" },
      });
    });
  });

  describe("findAll", () => {
    it("lists students excluding soft-deleted", async () => {
      const students = [{ id: "uuid-1", tenantId, name: "田中太郎", deletedAt: null }];
      prisma.student.findMany.mockResolvedValue(students);

      const result = await service.findAll(tenantId);
      expect(result).toEqual(students);
      expect(prisma.student.findMany).toHaveBeenCalledWith({
        where: { tenantId, deletedAt: null },
        include: {
          studentCourses: { include: { course: true } },
          studentParents: { include: { user: true } },
        },
      });
    });
  });

  describe("findById", () => {
    it("throws NotFoundException for non-existent student", async () => {
      prisma.student.findFirst.mockResolvedValue(null);

      await expect(service.findById(tenantId, "non-existent")).rejects.toThrow(NotFoundException);
    });

    it("throws NotFoundException for soft-deleted student", async () => {
      prisma.student.findFirst.mockResolvedValue(null);

      await expect(service.findById(tenantId, "deleted-id")).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("soft deletes a student by setting deletedAt", async () => {
      const student = { id: "uuid-1", tenantId, name: "田中太郎", deletedAt: null };
      prisma.student.findFirst.mockResolvedValue(student);
      const now = new Date();
      const deleted = { ...student, deletedAt: now };
      prisma.student.update.mockResolvedValue(deleted);

      const result = await service.delete(tenantId, "uuid-1");
      expect(result.deletedAt).toBeTruthy();
      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
