import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: "やまだピアノ教室",
      slug: "yamada-piano",
      genre: "PIANO",
    },
  });

  const teacher = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "山田花子",
      email: "teacher@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const beginnerCourse = await prisma.course.create({
    data: { tenantId: tenant.id, name: "ピアノ初級", monthlyFee: 8000 },
  });

  const advancedCourse = await prisma.course.create({
    data: { tenantId: tenant.id, name: "ピアノ上級", monthlyFee: 12000 },
  });

  const student1 = await prisma.student.create({
    data: { tenantId: tenant.id, name: "田中太郎", notes: "バイエル教本使用" },
  });

  const student2 = await prisma.student.create({
    data: { tenantId: tenant.id, name: "鈴木花", notes: "ブルグミュラー教本使用" },
  });

  const parent = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "田中一郎",
      email: "parent@example.com",
      role: "PARENT",
      status: "ACTIVE",
    },
  });

  await prisma.studentParent.create({
    data: { tenantId: tenant.id, studentId: student1.id, userId: parent.id },
  });

  await prisma.studentCourse.create({
    data: { tenantId: tenant.id, studentId: student1.id, courseId: beginnerCourse.id },
  });
  await prisma.studentCourse.create({
    data: { tenantId: tenant.id, studentId: student2.id, courseId: advancedCourse.id },
  });

  await prisma.lessonSlot.create({
    data: {
      tenantId: tenant.id,
      courseId: beginnerCourse.id,
      studentId: student1.id,
      dayOfWeek: "MON",
      startTime: "16:00",
      endTime: "17:00",
    },
  });

  await prisma.lessonSlot.create({
    data: {
      tenantId: tenant.id,
      courseId: advancedCourse.id,
      studentId: student2.id,
      dayOfWeek: "WED",
      startTime: "17:00",
      endTime: "18:00",
    },
  });

  console.log("Seed completed: tenant=%s, teacher=%s", tenant.slug, teacher.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
