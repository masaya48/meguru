import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateStudentDto) {
    return this.prisma.student.create({
      data: { tenantId, name: dto.name, notes: dto.notes },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.student.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        studentCourses: { include: { course: true } },
        studentParents: { include: { user: true } },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        studentCourses: { include: { course: true } },
        studentParents: { include: { user: true } },
      },
    });
    if (!student) throw new NotFoundException("Student not found");
    return student;
  }

  async update(tenantId: string, id: string, dto: UpdateStudentDto) {
    await this.findById(tenantId, id);
    return this.prisma.student.update({
      where: { id },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addParent(tenantId: string, studentId: string, userId: string) {
    await this.findById(tenantId, studentId);
    return this.prisma.studentParent.create({
      data: { tenantId, studentId, userId },
    });
  }

  async removeParent(tenantId: string, studentId: string, userId: string) {
    await this.findById(tenantId, studentId);
    return this.prisma.studentParent.delete({
      where: { studentId_userId: { studentId, userId } },
    });
  }

  async addCourse(tenantId: string, studentId: string, courseId: string) {
    await this.findById(tenantId, studentId);
    return this.prisma.studentCourse.create({
      data: { tenantId, studentId, courseId },
    });
  }

  async removeCourse(tenantId: string, studentId: string, courseId: string) {
    await this.findById(tenantId, studentId);
    return this.prisma.studentCourse.delete({
      where: { studentId_courseId: { studentId, courseId } },
    });
  }
}
