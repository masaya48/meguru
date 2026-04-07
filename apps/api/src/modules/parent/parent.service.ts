import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CreateParentDto } from "./dto/create-parent.dto";

@Injectable()
export class ParentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(tenantId: string, dto: CreateParentDto) {
    return this.prisma.user.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: "PARENT",
        status: "ACTIVE",
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, role: "PARENT" },
      include: {
        studentParents: { include: { student: true } },
      },
    });
  }

  async generateInviteLink(tenantId: string, studentId: string) {
    const token = this.jwtService.sign({ tenantId, studentId }, { expiresIn: "7d" });
    const appUrl = this.configService.getOrThrow<string>("APP_URL");
    const inviteUrl = `${appUrl}/line/invite?token=${token}`;
    return { inviteUrl };
  }
}
