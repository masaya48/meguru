import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // テナント作成
  const tenant = await prisma.tenant.upsert({
    where: { slug: "sakura-cho" },
    update: {},
    create: {
      name: "さくら町内会",
      slug: "sakura-cho",
    },
  });

  console.log(`Tenant: ${tenant.name} (${tenant.id})`);

  // グループ作成
  const group1 = await prisma.group.create({
    data: { tenantId: tenant.id, name: "1班", sortOrder: 1 },
  });
  const group2 = await prisma.group.create({
    data: { tenantId: tenant.id, name: "2班", sortOrder: 2 },
  });

  // 管理者作成
  const adminHash = await bcrypt.hash("admin12345", 10);
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "山田太郎",
      email: "admin@sakura-cho.example.com",
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      groupId: group1.id,
    },
  });

  // 住民作成
  const member1 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "鈴木花子",
      email: "hanako@example.com",
      role: "MEMBER",
      status: "ACTIVE",
      groupId: group1.id,
    },
  });
  const member2 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "佐藤次郎",
      email: "jiro@example.com",
      role: "MEMBER",
      status: "ACTIVE",
      groupId: group2.id,
    },
  });

  // 回覧作成（お知らせ）
  const notice = await prisma.circular.create({
    data: {
      tenantId: tenant.id,
      createdById: admin.id,
      title: "4月の集金について",
      body: "今月の自治会費の集金は4月15日に各班長が回ります。",
      type: "NOTICE",
      status: "PUBLISHED",
      targetType: "ALL",
      publishedAt: new Date(),
    },
  });

  // 回覧作成（出欠確認）
  const attendance = await prisma.circular.create({
    data: {
      tenantId: tenant.id,
      createdById: admin.id,
      title: "春の一斉清掃のお知らせ",
      body: "4月20日（日）9:00〜11:00に一斉清掃を実施します。集合場所は公民館前です。",
      type: "ATTENDANCE",
      status: "PUBLISHED",
      targetType: "ALL",
      deadline: new Date("2026-04-18"),
      publishedAt: new Date(),
    },
  });

  await prisma.circularQuestion.create({
    data: {
      circularId: attendance.id,
      questionText: "参加できますか？",
      type: "YES_NO",
      options: ["参加する", "不参加"],
      sortOrder: 0,
    },
  });

  // 既読データ
  await prisma.circularRead.create({
    data: { circularId: notice.id, userId: member1.id },
  });

  console.log("Seed completed");
  console.log(`  Admin: admin@sakura-cho.example.com / admin12345`);
  console.log(`  Members: ${member1.name}, ${member2.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
