import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      include: { group: true },
      orderBy: { name: "asc" },
    });
  }

  async findById(tenantId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { group: true },
    });
    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async update(tenantId: string, userId: string, dto: UpdateUserDto) {
    await this.findById(tenantId, userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async approve(tenantId: string, userId: string) {
    await this.findById(tenantId, userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });
  }
}
