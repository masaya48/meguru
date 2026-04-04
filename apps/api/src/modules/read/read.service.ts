import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReadService {
  constructor(private readonly prisma: PrismaService) {}

  async markAsRead(tenantId: string, circularId: string, userId: string) {
    const circular = await this.prisma.circular.findUnique({
      where: { id: circularId },
    });
    if (!circular || circular.tenantId !== tenantId) {
      throw new NotFoundException("Circular not found");
    }

    return this.prisma.circularRead.upsert({
      where: {
        circularId_userId: { circularId, userId },
      },
      create: { circularId, userId },
      update: {},
    });
  }

  async getReadStatus(tenantId: string, circularId: string) {
    const circular = await this.prisma.circular.findUnique({
      where: { id: circularId },
    });
    if (!circular || circular.tenantId !== tenantId) {
      throw new NotFoundException("Circular not found");
    }

    return this.prisma.circularRead.findMany({
      where: { circularId },
      include: { user: { select: { id: true, name: true, groupId: true } } },
      orderBy: { readAt: "desc" },
    });
  }
}
