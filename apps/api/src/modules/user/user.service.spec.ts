import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { PrismaService } from "../prisma/prisma.service";

describe("UserService", () => {
  let service: UserService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe("findByTenant", () => {
    it("returns all users in a tenant", async () => {
      const users = [
        { id: "u1", name: "User 1", tenantId: "t1" },
        { id: "u2", name: "User 2", tenantId: "t1" },
      ];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.findByTenant("t1");
      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { tenantId: "t1" },
        include: { group: true },
        orderBy: { name: "asc" },
      });
    });
  });

  describe("update", () => {
    it("updates user fields", async () => {
      const updated = { id: "u1", name: "Updated", tenantId: "t1" };
      prisma.user.findUnique.mockResolvedValue({ id: "u1", tenantId: "t1" });
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.update("t1", "u1", { name: "Updated" });
      expect(result).toEqual(updated);
    });
  });
});
