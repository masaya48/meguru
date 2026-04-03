import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCircularDto } from "./dto/create-circular.dto";
import { UpdateCircularDto } from "./dto/update-circular.dto";

@Injectable()
export class CircularService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateCircularDto) {
    const { questions, ...circularData } = dto;

    return this.prisma.circular.create({
      data: {
        tenantId,
        createdById: userId,
        title: circularData.title,
        body: circularData.body,
        type: circularData.type,
        status: "DRAFT",
        targetType: circularData.targetType ?? "ALL",
        targetGroupIds: circularData.targetGroupIds ?? [],
        deadline: circularData.deadline ? new Date(circularData.deadline) : null,
        templateId: circularData.templateId ?? null,
        questions: questions
          ? {
              create: questions.map((q, i) => ({
                questionText: q.questionText,
                type: q.type,
                options: q.options ?? undefined,
                sortOrder: q.sortOrder ?? i,
              })),
            }
          : undefined,
      },
      include: {
        questions: { orderBy: { sortOrder: "asc" } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async findByTenant(tenantId: string, status?: string) {
    return this.prisma.circular.findMany({
      where: {
        tenantId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { reads: true, questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(tenantId: string, circularId: string) {
    const circular = await this.prisma.circular.findUnique({
      where: { id: circularId },
      include: {
        createdBy: { select: { id: true, name: true } },
        questions: {
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { answers: true } } },
        },
        reads: { select: { userId: true, readAt: true } },
      },
    });
    if (!circular || circular.tenantId !== tenantId) {
      throw new NotFoundException("Circular not found");
    }
    return circular;
  }

  async update(tenantId: string, circularId: string, dto: UpdateCircularDto) {
    const circular = await this.findById(tenantId, circularId);
    if (circular.status !== "DRAFT") {
      throw new BadRequestException("Only draft circulars can be edited");
    }

    const { questions, ...data } = dto;
    return this.prisma.circular.update({
      where: { id: circularId },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
      include: {
        questions: { orderBy: { sortOrder: "asc" } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async publish(tenantId: string, circularId: string) {
    const circular = await this.prisma.circular.findUnique({
      where: { id: circularId },
    });
    if (!circular || circular.tenantId !== tenantId) {
      throw new NotFoundException("Circular not found");
    }
    if (circular.status !== "DRAFT") {
      throw new BadRequestException("Only draft circulars can be published");
    }

    return this.prisma.circular.update({
      where: { id: circularId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }

  async close(tenantId: string, circularId: string) {
    const circular = await this.prisma.circular.findUnique({
      where: { id: circularId },
    });
    if (!circular || circular.tenantId !== tenantId) {
      throw new NotFoundException("Circular not found");
    }
    if (circular.status !== "PUBLISHED") {
      throw new BadRequestException("Only published circulars can be closed");
    }

    return this.prisma.circular.update({
      where: { id: circularId },
      data: { status: "CLOSED", closedAt: new Date() },
    });
  }

  async delete(tenantId: string, circularId: string) {
    const circular = await this.prisma.circular.findUnique({
      where: { id: circularId },
    });
    if (!circular || circular.tenantId !== tenantId) {
      throw new NotFoundException("Circular not found");
    }
    if (circular.status !== "DRAFT") {
      throw new BadRequestException("Only draft circulars can be deleted");
    }

    return this.prisma.circular.delete({ where: { id: circularId } });
  }

  /** 回覧の統計情報（管理者向け） */
  async getStats(tenantId: string, circularId: string) {
    const circular = await this.prisma.circular.findUnique({
      where: { id: circularId },
      include: {
        reads: true,
        questions: {
          include: {
            answers: { include: { user: { select: { id: true, name: true } } } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!circular || circular.tenantId !== tenantId) {
      throw new NotFoundException("Circular not found");
    }

    // 対象ユーザー数を取得
    const targetUserCount = await this.prisma.user.count({
      where: {
        tenantId,
        status: "ACTIVE",
        ...(circular.targetType === "GROUP" && circular.targetGroupIds.length > 0
          ? { groupId: { in: circular.targetGroupIds } }
          : {}),
      },
    });

    return {
      circular,
      totalTargetUsers: targetUserCount,
      readCount: circular.reads.length,
      readRate:
        targetUserCount > 0 ? Math.round((circular.reads.length / targetUserCount) * 100) : 0,
      questions: circular.questions.map((q) => ({
        ...q,
        answerCount: q.answers.length,
        answerRate:
          targetUserCount > 0 ? Math.round((q.answers.length / targetUserCount) * 100) : 0,
      })),
    };
  }
}
