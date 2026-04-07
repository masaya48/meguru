import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAbsenceDto } from "./dto/create-absence.dto";

@Injectable()
export class AbsenceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateAbsenceDto) {
    const session = await this.prisma.lessonSession.findFirst({
      where: { id: dto.lessonSessionId, tenantId },
    });

    if (!session) throw new NotFoundException("Lesson session not found");

    if (session.status !== "SCHEDULED") {
      throw new BadRequestException("Lesson session is not in SCHEDULED status");
    }

    const [updatedSession] = await this.prisma.$transaction([
      this.prisma.lessonSession.update({
        where: { id: dto.lessonSessionId },
        data: { status: "CANCELLED" },
      }),
      this.prisma.attendance.upsert({
        where: { lessonSessionId: dto.lessonSessionId },
        create: {
          tenantId,
          lessonSessionId: dto.lessonSessionId,
          studentId: session.studentId,
          status: "ABSENT",
        },
        update: {
          status: "ABSENT",
        },
      }),
    ]);

    return updatedSession;
  }
}
