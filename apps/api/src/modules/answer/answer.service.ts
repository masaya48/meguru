import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SubmitAnswerDto } from "./dto/submit-answer.dto";

@Injectable()
export class AnswerService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(tenantId: string, userId: string, dto: SubmitAnswerDto) {
    const question = await this.prisma.circularQuestion.findUnique({
      where: { id: dto.questionId },
      include: { circular: { select: { tenantId: true, status: true, deadline: true } } },
    });
    if (!question || question.circular.tenantId !== tenantId) {
      throw new NotFoundException("Question not found");
    }
    if (question.circular.status !== "PUBLISHED") {
      throw new BadRequestException("Circular is not accepting answers");
    }
    if (question.circular.deadline && new Date() > question.circular.deadline) {
      throw new BadRequestException("Answer deadline has passed");
    }

    return this.prisma.circularAnswer.upsert({
      where: {
        questionId_userId: { questionId: dto.questionId, userId },
      },
      create: {
        questionId: dto.questionId,
        userId,
        answer: dto.answer as any,
      },
      update: {
        answer: dto.answer as any,
        answeredAt: new Date(),
      },
    });
  }

  async getByCircular(circularId: string) {
    return this.prisma.circularAnswer.findMany({
      where: { question: { circularId } },
      include: {
        user: { select: { id: true, name: true } },
        question: { select: { id: true, questionText: true, type: true } },
      },
      orderBy: { answeredAt: "desc" },
    });
  }

  async getMyAnswers(userId: string, circularId: string) {
    return this.prisma.circularAnswer.findMany({
      where: {
        userId,
        question: { circularId },
      },
      include: {
        question: { select: { id: true, questionText: true, type: true, options: true } },
      },
    });
  }
}
