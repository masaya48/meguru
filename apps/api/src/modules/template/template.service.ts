import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateTemplateDto) {
    return this.prisma.template.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description ?? null,
        bodyTemplate: dto.bodyTemplate,
        type: dto.type,
        questions: (dto.questions as any) ?? null,
      },
    });
  }

  async findByTenant(tenantId: string) {
    return this.prisma.template.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(tenantId: string, templateId: string) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });
    if (!template || template.tenantId !== tenantId) {
      throw new NotFoundException("Template not found");
    }
    return template;
  }

  async update(tenantId: string, templateId: string, dto: UpdateTemplateDto) {
    await this.findById(tenantId, templateId);
    return this.prisma.template.update({
      where: { id: templateId },
      data: {
        ...dto,
        questions: dto.questions as any,
      },
    });
  }

  async delete(tenantId: string, templateId: string) {
    await this.findById(tenantId, templateId);
    return this.prisma.template.delete({ where: { id: templateId } });
  }
}
