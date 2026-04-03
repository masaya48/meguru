import { Test, TestingModule } from "@nestjs/testing";
import { TemplateService } from "./template.service";
import { PrismaService } from "../prisma/prisma.service";

describe("TemplateService", () => {
  let service: TemplateService;
  let prisma: {
    template: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      template: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
  });

  it("creates a template", async () => {
    const dto = {
      name: "出欠確認",
      bodyTemplate: "{{event}}の出欠を確認します",
      type: "ATTENDANCE" as const,
    };
    prisma.template.create.mockResolvedValue({ id: "tmpl1", ...dto });

    const result = await service.create("t1", dto);
    expect(result.name).toBe("出欠確認");
  });

  it("lists templates by tenant", async () => {
    prisma.template.findMany.mockResolvedValue([]);
    const result = await service.findByTenant("t1");
    expect(result).toEqual([]);
  });

  it("deletes a template", async () => {
    prisma.template.findUnique.mockResolvedValue({ id: "tmpl1", tenantId: "t1" });
    prisma.template.delete.mockResolvedValue({ id: "tmpl1" });
    const result = await service.delete("t1", "tmpl1");
    expect(result.id).toBe("tmpl1");
  });
});
