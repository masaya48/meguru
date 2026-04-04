import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        tenantId,
        name: dto.name,
        monthlyFee: dto.monthlyFee,
        ...(dto.maxMonthlyReschedules !== undefined && {
          maxMonthlyReschedules: dto.maxMonthlyReschedules,
        }),
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.course.findMany({
      where: { tenantId, deletedAt: null },
    });
  }

  async findById(tenantId: string, id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!course) throw new NotFoundException("Course not found");
    return course;
  }

  async update(tenantId: string, id: string, dto: UpdateCourseDto) {
    await this.findById(tenantId, id);
    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
