import { Test, TestingModule } from "@nestjs/testing";
import { TenantService } from "./tenant.service";
import { PrismaService } from "../prisma/prisma.service";
import { ConflictException } from "@nestjs/common";

describe("TenantService", () => {
  let service: TenantService;
  let prisma: {
    tenant: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      tenant: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  describe("create", () => {
    it("creates a tenant with name and slug", async () => {
      const dto = { name: "○○町内会", slug: "marumaru" };
      const expected = { id: "uuid-1", ...dto, plan: "free" };
      prisma.tenant.findUnique.mockResolvedValue(null);
      prisma.tenant.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(prisma.tenant.create).toHaveBeenCalledWith({
        data: { name: "○○町内会", slug: "marumaru" },
      });
    });

    it("throws ConflictException on duplicate slug", async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: "existing" });
      await expect(service.create({ name: "Test", slug: "existing-slug" })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("findBySlug", () => {
    it("returns tenant by slug", async () => {
      const tenant = { id: "uuid-1", name: "Test", slug: "test" };
      prisma.tenant.findUnique.mockResolvedValue(tenant);
      expect(await service.findBySlug("test")).toEqual(tenant);
    });
  });
});
