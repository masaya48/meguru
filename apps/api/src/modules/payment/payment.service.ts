import { Injectable, NotFoundException } from "@nestjs/common";
import { PaymentStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { GeneratePaymentsDto } from "./dto/generate-payments.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(
    tenantId: string,
    dto: GeneratePaymentsDto,
  ): Promise<{ created: number; skipped: number }> {
    const { year, month } = dto;

    const studentCourses = await this.prisma.studentCourse.findMany({
      where: {
        tenantId,
        student: { deletedAt: null },
        course: { deletedAt: null },
      },
      include: {
        course: true,
      },
    });

    let created = 0;
    let skipped = 0;

    for (const sc of studentCourses) {
      const existing = await this.prisma.payment.findFirst({
        where: {
          tenantId,
          studentId: sc.studentId,
          courseId: sc.courseId,
          year,
          month,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await this.prisma.payment.create({
        data: {
          tenantId,
          studentId: sc.studentId,
          courseId: sc.courseId,
          year,
          month,
          amount: sc.course.monthlyFee,
          status: PaymentStatus.UNPAID,
        },
      });
      created++;
    }

    return { created, skipped };
  }

  async findAll(tenantId: string, year?: number, month?: number) {
    return this.prisma.payment.findMany({
      where: {
        tenantId,
        ...(year !== undefined ? { year } : {}),
        ...(month !== undefined ? { month } : {}),
      },
      include: {
        student: true,
        course: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  }

  async markPaid(tenantId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
    });
    if (!payment) throw new NotFoundException("Payment not found");

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });
  }

  async update(tenantId: string, paymentId: string, dto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
    });
    if (!payment) throw new NotFoundException("Payment not found");

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: dto,
    });
  }

  async getSummary(tenantId: string, year: number, month: number) {
    const payments = await this.prisma.payment.findMany({
      where: { tenantId, year, month },
      select: { status: true, amount: true },
    });

    const total = payments.length;
    const paid = payments.filter((p) => p.status === PaymentStatus.PAID).length;
    const unpaid = payments.filter((p) => p.status === PaymentStatus.UNPAID).length;
    const overdue = payments.filter((p) => p.status === PaymentStatus.OVERDUE).length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.amount, 0);

    return { total, paid, unpaid, overdue, totalAmount, paidAmount };
  }
}
