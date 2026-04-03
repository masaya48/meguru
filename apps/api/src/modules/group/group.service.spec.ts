import { Test, TestingModule } from "@nestjs/testing";
import { GroupService } from "./group.service";
import { PrismaService } from "../prisma/prisma.service";

describe("GroupService", () => {
  let service: GroupService;
  let prisma: {
    group: { findMany: jest.Mock; create: jest.Mock; findUnique: jest.Mock; delete: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      group: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it("creates a group", async () => {
    prisma.group.create.mockResolvedValue({
      id: "g1",
      tenantId: "t1",
      name: "1班",
      sortOrder: 1,
    });

    const result = await service.create("t1", { name: "1班", sortOrder: 1 });
    expect(result.name).toBe("1班");
  });

  it("lists groups by tenant", async () => {
    prisma.group.findMany.mockResolvedValue([]);
    const result = await service.findByTenant("t1");
    expect(result).toEqual([]);
  });
});
