import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGroupDto } from "./dto/create-group.dto";

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    return this.prisma.group.findMany({
      where: { tenantId },
      include: { _count: { select: { users: true } } },
      orderBy: { sortOrder: "asc" },
    });
  }

  async create(tenantId: string, dto: CreateGroupDto) {
    return this.prisma.group.create({
      data: { tenantId, name: dto.name, sortOrder: dto.sortOrder ?? 0 },
    });
  }

  async delete(tenantId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group || group.tenantId !== tenantId) {
      throw new NotFoundException("Group not found");
    }
    return this.prisma.group.delete({ where: { id: groupId } });
  }
}
