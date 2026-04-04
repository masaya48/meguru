# まなぶん Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pivot the meguru codebase from a circular board SaaS to "まなぶん", a lesson management SaaS for individual tutors, with attendance, rescheduling, tuition, and AI-powered lesson reports via LINE.

**Architecture:** Clean-start pivot: delete all circular-board domain code, rewrite Prisma schema for lesson management domain, keep infrastructure (auth, tenant, LINE, mail, Prisma module). NestJS API with 11 new modules, Next.js frontend with teacher (mobile-first bottom nav) and parent (minimal, LINE-supplementary) route groups.

**Tech Stack:** Next.js 16 (App Router), NestJS 11, Prisma, PostgreSQL, LINE Messaging API, Claude API (Anthropic SDK), Tailwind CSS 4, pnpm workspace monorepo.

**Spec:** `docs/superpowers/specs/2026-04-04-manabun-design.md`

---

## Phase 1: Foundation — Schema & Cleanup

### Task 1: Delete old domain code

Remove all circular-board domain modules, pages, and components. Keep infrastructure.

**Files:**
- Delete: `apps/api/src/modules/circular/` (entire directory)
- Delete: `apps/api/src/modules/answer/` (entire directory)
- Delete: `apps/api/src/modules/read/` (entire directory)
- Delete: `apps/api/src/modules/template/` (entire directory)
- Delete: `apps/api/src/modules/group/` (entire directory)
- Delete: `apps/api/src/modules/user/` (entire directory)
- Delete: `apps/web/app/(admin)/` (entire directory)
- Delete: `apps/web/app/(resident)/` (entire directory)
- Delete: `apps/web/components/circular-card.tsx`
- Delete: `apps/web/components/layouts/admin-sidebar.tsx`
- Delete: `apps/web/components/layouts/admin-mobile-nav.tsx`
- Modify: `apps/api/src/app.module.ts` — remove deleted module imports

- [ ] **Step 1: Delete API domain modules**

```bash
rm -rf apps/api/src/modules/circular
rm -rf apps/api/src/modules/answer
rm -rf apps/api/src/modules/read
rm -rf apps/api/src/modules/template
rm -rf apps/api/src/modules/group
rm -rf apps/api/src/modules/user
```

- [ ] **Step 2: Update app.module.ts**

Remove imports for: `CircularModule`, `ReadModule`, `AnswerModule`, `TemplateModule`, `GroupModule`, `UserModule`. Keep: `ConfigModule`, `PrismaModule`, `TenantModule`, `AuthModule`, `MailModule`, `LineModule`, `NotificationModule`, `ScheduleModule`.

```typescript
// apps/api/src/app.module.ts
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { TenantModule } from "./modules/tenant/tenant.module";
import { AuthModule } from "./modules/auth/auth.module";
import { MailModule } from "./modules/mail/mail.module";
import { LineModule } from "./modules/line/line.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { AuthGuard } from "./common/guards/auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    TenantModule,
    AuthModule,
    MailModule,
    LineModule,
    NotificationModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
```

- [ ] **Step 3: Delete frontend domain pages and components**

```bash
rm -rf apps/web/app/\(admin\)
rm -rf apps/web/app/\(resident\)
rm -f apps/web/components/circular-card.tsx
rm -f apps/web/components/layouts/admin-sidebar.tsx
rm -f apps/web/components/layouts/admin-mobile-nav.tsx
```

- [ ] **Step 4: Verify build compiles**

```bash
cd apps/api && pnpm build
```

Expected: Build succeeds (or minor import errors to fix in line/notification modules referencing deleted code).

- [ ] **Step 5: Gut notification and LINE modules to compile against new schema**

The existing `notification.service.ts` and `line-message.builder.ts` reference `Circular`, `circularId`, and circular-specific Flex Messages that will no longer exist after the schema rewrite. Strip these modules to empty shells:

```typescript
// apps/api/src/modules/notification/notification.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LineService } from "../line/line.service";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly lineService: LineService,
  ) {}

  // TODO: Implement manabun notification methods in Task 14
}
```

```typescript
// apps/api/src/modules/line/line-message.builder.ts
// TODO: Implement manabun Flex Message builders in Task 14
export {};
```

Also remove any `@Cron` decorated methods from the notification service (these will be re-added in Task 14).

Remove any webhook handler logic in `line-webhook.controller.ts` that references circular-specific postback data. Keep the basic signature verification and event parsing structure.

- [ ] **Step 6: Commit**

```bash
git add apps/api/ apps/web/
git commit -m "chore: remove circular-board domain code for manabun pivot"
```

---

### Task 2: Rewrite Prisma schema

Replace all circular-board models and enums with the manabun lesson management schema.

**Files:**
- Modify: `packages/db/prisma/schema.prisma`

- [ ] **Step 1: Write the new schema**

Replace the entire schema with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───

enum Role {
  TEACHER
  PARENT
}

enum UserStatus {
  ACTIVE
  PENDING
}

enum Genre {
  PIANO
  CALLIGRAPHY
  STUDY
  YOGA
  SWIMMING
  OTHER
}

enum DayOfWeek {
  MON
  TUE
  WED
  THU
  FRI
  SAT
  SUN
}

enum SessionStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  RESCHEDULED
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}

enum ReportStatus {
  DRAFT
  SENT
}

enum RescheduleStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PAID
  OVERDUE
}

enum NotificationChannel {
  LINE
}

enum NotificationType {
  LESSON_REMINDER
  REPORT
  RESCHEDULE
  PAYMENT_REMINDER
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
}

// ─── Models ───

model Tenant {
  id        String   @id @default(uuid()) @db.Uuid
  name      String   @db.VarChar(100)
  slug      String   @unique @db.VarChar(50)
  genre     Genre    @default(OTHER)
  plan      String   @default("free") @db.VarChar(20)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users              User[]
  students           Student[]
  courses            Course[]
  lessonSlots        LessonSlot[]
  lessonSessions     LessonSession[]
  attendances        Attendance[]
  lessonNotes        LessonNote[]
  monthlySummaries   MonthlySummary[]
  rescheduleRequests RescheduleRequest[]
  payments           Payment[]
  notifications      Notification[]
  studentParents     StudentParent[]
  studentCourses     StudentCourse[]

  @@map("tenants")
}

model User {
  id           String     @id @default(uuid()) @db.Uuid
  tenantId     String     @db.Uuid
  name         String     @db.VarChar(50)
  email        String?    @db.VarChar(255)
  phone        String?    @db.VarChar(20)
  lineUserId   String?    @db.VarChar(100)
  passwordHash String?    @db.VarChar(255)
  role         Role       @default(PARENT)
  status       UserStatus @default(PENDING)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  tenant             Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  studentParents     StudentParent[]
  rescheduleRequests RescheduleRequest[]
  notifications      Notification[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([lineUserId])
  @@map("users")
}

model Student {
  id        String    @id @default(uuid()) @db.Uuid
  tenantId  String    @db.Uuid
  name      String    @db.VarChar(50)
  notes     String?   @db.Text
  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  tenant             Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  studentParents     StudentParent[]
  studentCourses     StudentCourse[]
  lessonSlots        LessonSlot[]
  lessonSessions     LessonSession[]
  attendances        Attendance[]
  lessonNotes        LessonNote[]
  monthlySummaries   MonthlySummary[]
  rescheduleRequests RescheduleRequest[]
  payments           Payment[]

  @@index([tenantId])
  @@map("students")
}

model StudentParent {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @db.Uuid
  studentId String   @db.Uuid
  userId    String   @db.Uuid
  createdAt DateTime @default(now())

  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([studentId, userId])
  @@index([tenantId])
  @@map("student_parents")
}

model Course {
  id                    String    @id @default(uuid()) @db.Uuid
  tenantId              String    @db.Uuid
  name                  String    @db.VarChar(100)
  monthlyFee            Int
  maxMonthlyReschedules Int       @default(2)
  deletedAt             DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  tenant           Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  studentCourses   StudentCourse[]
  lessonSlots      LessonSlot[]
  lessonSessions   LessonSession[]
  monthlySummaries MonthlySummary[]
  payments         Payment[]

  @@index([tenantId])
  @@map("courses")
}

model StudentCourse {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @db.Uuid
  studentId String   @db.Uuid
  courseId   String   @db.Uuid
  createdAt DateTime @default(now())

  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  course  Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([studentId, courseId])
  @@index([tenantId])
  @@map("student_courses")
}

model LessonSlot {
  id        String    @id @default(uuid()) @db.Uuid
  tenantId  String    @db.Uuid
  courseId   String    @db.Uuid
  studentId String    @db.Uuid
  dayOfWeek DayOfWeek
  startTime String    @db.VarChar(5) // "HH:mm"
  endTime   String    @db.VarChar(5) // "HH:mm"
  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  tenant         Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  course         Course          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  student        Student         @relation(fields: [studentId], references: [id], onDelete: Cascade)
  lessonSessions LessonSession[]

  @@index([tenantId, dayOfWeek])
  @@map("lesson_slots")
}

model LessonSession {
  id           String        @id @default(uuid()) @db.Uuid
  tenantId     String        @db.Uuid
  lessonSlotId String?       @db.Uuid
  studentId    String        @db.Uuid
  courseId      String        @db.Uuid
  date         DateTime      @db.Date
  startTime    String        @db.VarChar(5) // "HH:mm"
  endTime      String        @db.VarChar(5) // "HH:mm"
  status       SessionStatus @default(SCHEDULED)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  tenant     Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  lessonSlot LessonSlot? @relation(fields: [lessonSlotId], references: [id], onDelete: SetNull)
  student    Student     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  course     Course      @relation(fields: [courseId], references: [id], onDelete: Cascade)

  attendance         Attendance?
  lessonNote         LessonNote?
  originalReschedule RescheduleRequest[] @relation("OriginalSession")
  targetReschedule   RescheduleRequest[] @relation("TargetSession")

  @@index([tenantId, date])
  @@index([studentId, date])
  @@map("lesson_sessions")
}

model Attendance {
  id              String           @id @default(uuid()) @db.Uuid
  tenantId        String           @db.Uuid
  lessonSessionId String           @unique @db.Uuid
  studentId       String           @db.Uuid
  status          AttendanceStatus
  note            String?          @db.VarChar(500)
  createdAt       DateTime         @default(now())

  tenant        Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  lessonSession LessonSession @relation(fields: [lessonSessionId], references: [id], onDelete: Cascade)
  student       Student       @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("attendances")
}

model LessonNote {
  id              String       @id @default(uuid()) @db.Uuid
  tenantId        String       @db.Uuid
  lessonSessionId String       @unique @db.Uuid
  studentId       String       @db.Uuid
  teacherMemo     String       @db.Text
  aiReport        String?      @db.Text
  reportStatus    ReportStatus @default(DRAFT)
  sentAt          DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  tenant        Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  lessonSession LessonSession @relation(fields: [lessonSessionId], references: [id], onDelete: Cascade)
  student       Student       @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([tenantId, reportStatus])
  @@map("lesson_notes")
}

model MonthlySummary {
  id            String       @id @default(uuid()) @db.Uuid
  tenantId      String       @db.Uuid
  studentId     String       @db.Uuid
  courseId       String       @db.Uuid
  year          Int
  month         Int
  aiSummary     String       @db.Text
  editedSummary String?      @db.Text
  reportStatus  ReportStatus @default(DRAFT)
  sentAt        DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  course  Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([tenantId, studentId, courseId, year, month])
  @@map("monthly_summaries")
}

model RescheduleRequest {
  id                 String           @id @default(uuid()) @db.Uuid
  tenantId           String           @db.Uuid
  originalSessionId  String           @db.Uuid
  requestedSessionId String?          @db.Uuid
  studentId          String           @db.Uuid
  requestedById      String           @db.Uuid
  status             RescheduleStatus @default(PENDING)
  suggestedSlots     Json?
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  tenant           Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  originalSession  LessonSession @relation("OriginalSession", fields: [originalSessionId], references: [id], onDelete: Cascade)
  requestedSession LessonSession? @relation("TargetSession", fields: [requestedSessionId], references: [id], onDelete: SetNull)
  student          Student       @relation(fields: [studentId], references: [id], onDelete: Cascade)
  requestedBy      User          @relation(fields: [requestedById], references: [id], onDelete: Cascade)

  @@index([tenantId, status])
  @@index([studentId])
  @@map("reschedule_requests")
}

model Payment {
  id        String        @id @default(uuid()) @db.Uuid
  tenantId  String        @db.Uuid
  studentId String        @db.Uuid
  courseId   String        @db.Uuid
  year      Int
  month     Int
  amount    Int
  status    PaymentStatus @default(UNPAID)
  paidAt    DateTime?
  note      String?       @db.VarChar(500)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  course  Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([studentId, courseId, year, month])
  @@index([tenantId, year, month])
  @@map("payments")
}

model Notification {
  id            String             @id @default(uuid()) @db.Uuid
  tenantId      String             @db.Uuid
  userId        String             @db.Uuid
  channel       NotificationChannel
  type          NotificationType
  status        NotificationStatus @default(PENDING)
  referenceId   String?            @db.Uuid
  referenceType String?            @db.VarChar(50)
  sentAt        DateTime?
  createdAt     DateTime           @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([tenantId, status])
  @@index([userId, status])
  @@map("notifications")
}
```

- [ ] **Step 2: Reset database and generate client**

```bash
cd packages/db
pnpm generate
```

Since this is a full schema rewrite, we need a fresh migration:

```bash
# Drop existing migrations and create new baseline
rm -rf prisma/migrations
pnpm migrate --name init_manabun
```

- [ ] **Step 3: Rewrite @meguru/db exports**

The current `packages/db/src/index.ts` exports all old enum and model types that no longer exist. Replace it entirely:

```typescript
// packages/db/src/index.ts
export {
  PrismaClient,
  Role,
  UserStatus,
  Genre,
  DayOfWeek,
  SessionStatus,
  AttendanceStatus,
  ReportStatus,
  RescheduleStatus,
  PaymentStatus,
  NotificationChannel,
  NotificationType,
  NotificationStatus,
} from "@prisma/client";
export type {
  Tenant,
  User,
  Student,
  StudentParent,
  Course,
  StudentCourse,
  LessonSlot,
  LessonSession,
  Attendance,
  LessonNote,
  MonthlySummary,
  RescheduleRequest,
  Payment,
  Notification,
} from "@prisma/client";
```

- [ ] **Step 4: Fix auth module for new Role enum**

In `apps/api/src/modules/auth/`, update any reference to `Role.ADMIN` / `Role.MEMBER` to use `Role.TEACHER` / `Role.PARENT`. Check DTOs and service.

- [ ] **Step 5: Fix tenant module for Genre field**

In `apps/api/src/modules/tenant/`, add `genre` to create/update DTOs.

- [ ] **Step 6: Verify API builds**

```bash
cd apps/api && pnpm build
```

Fix any remaining type errors from the schema change.

- [ ] **Step 7: Write seed data**

Replace `packages/db/prisma/seed.ts` with manabun seed data:

```typescript
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create tenant (classroom)
  const tenant = await prisma.tenant.create({
    data: {
      name: "やまだピアノ教室",
      slug: "yamada-piano",
      genre: "PIANO",
    },
  });

  // Create teacher
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

  // Create courses
  const beginnerCourse = await prisma.course.create({
    data: {
      tenantId: tenant.id,
      name: "ピアノ初級",
      monthlyFee: 8000,
    },
  });

  const advancedCourse = await prisma.course.create({
    data: {
      tenantId: tenant.id,
      name: "ピアノ上級",
      monthlyFee: 12000,
    },
  });

  // Create students
  const student1 = await prisma.student.create({
    data: {
      tenantId: tenant.id,
      name: "田中太郎",
      notes: "バイエル教本使用",
    },
  });

  const student2 = await prisma.student.create({
    data: {
      tenantId: tenant.id,
      name: "鈴木花",
      notes: "ブルグミュラー教本使用",
    },
  });

  // Create parent
  const parent = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "田中一郎",
      email: "parent@example.com",
      role: "PARENT",
      status: "ACTIVE",
    },
  });

  // Link parent to student
  await prisma.studentParent.create({
    data: {
      tenantId: tenant.id,
      studentId: student1.id,
      userId: parent.id,
    },
  });

  // Enroll students in courses
  await prisma.studentCourse.create({
    data: { tenantId: tenant.id, studentId: student1.id, courseId: beginnerCourse.id },
  });
  await prisma.studentCourse.create({
    data: { tenantId: tenant.id, studentId: student2.id, courseId: advancedCourse.id },
  });

  // Create lesson slots
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
```

- [ ] **Step 8: Run seed**

```bash
cd packages/db && pnpm seed
```

- [ ] **Step 9: Add ANTHROPIC_API_KEY to .env.example**

Add the following to `apps/api/.env.example` (or `.env`):

```
ANTHROPIC_API_KEY=your-anthropic-api-key
```

This is needed by the AI module (Task 9) but should be set up early so the env is ready.

- [ ] **Step 10: Commit**

```bash
git add packages/db/ apps/api/.env.example
git commit -m "feat: rewrite prisma schema for manabun lesson management domain"
```

---

## Phase 2: Core API Modules

### Task 3: Student module

**Files:**
- Create: `apps/api/src/modules/student/student.module.ts`
- Create: `apps/api/src/modules/student/student.controller.ts`
- Create: `apps/api/src/modules/student/student.service.ts`
- Create: `apps/api/src/modules/student/dto/create-student.dto.ts`
- Create: `apps/api/src/modules/student/dto/update-student.dto.ts`
- Test: `apps/api/src/modules/student/student.service.spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write failing tests for student service**

```typescript
// apps/api/src/modules/student/student.service.spec.ts
import { Test } from "@nestjs/testing";
import { StudentService } from "./student.service";
import { PrismaService } from "../prisma/prisma.service";

describe("StudentService", () => {
  let service: StudentService;
  let prisma: { student: any; studentParent: any; studentCourse: any };

  beforeEach(async () => {
    prisma = {
      student: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      studentParent: { create: jest.fn(), delete: jest.fn() },
      studentCourse: { create: jest.fn(), delete: jest.fn() },
    };

    const module = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(StudentService);
  });

  it("creates a student with tenantId", async () => {
    const dto = { name: "田中太郎", notes: "バイエル使用" };
    prisma.student.create.mockResolvedValue({ id: "1", tenantId: "t1", ...dto });

    const result = await service.create("t1", dto);

    expect(prisma.student.create).toHaveBeenCalledWith({
      data: { tenantId: "t1", name: "田中太郎", notes: "バイエル使用" },
    });
    expect(result.name).toBe("田中太郎");
  });

  it("lists students excluding soft-deleted", async () => {
    prisma.student.findMany.mockResolvedValue([]);
    await service.findAll("t1");

    expect(prisma.student.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: "t1", deletedAt: null },
      }),
    );
  });

  it("soft deletes a student", async () => {
    prisma.student.findUnique.mockResolvedValue({ id: "1", tenantId: "t1" });
    prisma.student.update.mockResolvedValue({ id: "1", deletedAt: new Date() });

    await service.delete("t1", "1");

    expect(prisma.student.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/api && npx jest src/modules/student/student.service.spec.ts --no-cache
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement DTOs**

```typescript
// apps/api/src/modules/student/dto/create-student.dto.ts
import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

```typescript
// apps/api/src/modules/student/dto/update-student.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateStudentDto } from "./create-student.dto";

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
```

- [ ] **Step 4: Implement student service**

```typescript
// apps/api/src/modules/student/student.service.ts
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
        studentParents: { include: { user: { select: { id: true, name: true, lineUserId: true } } } },
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(tenantId: string, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        studentCourses: { include: { course: true } },
        studentParents: { include: { user: { select: { id: true, name: true, lineUserId: true } } } },
      },
    });
    if (!student || student.tenantId !== tenantId || student.deletedAt) {
      throw new NotFoundException("Student not found");
    }
    return student;
  }

  async update(tenantId: string, id: string, dto: UpdateStudentDto) {
    await this.findById(tenantId, id);
    return this.prisma.student.update({ where: { id }, data: dto });
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
    return this.prisma.studentParent.deleteMany({
      where: { studentId, userId },
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
    return this.prisma.studentCourse.deleteMany({
      where: { studentId, courseId },
    });
  }
}
```

- [ ] **Step 5: Implement controller**

```typescript
// apps/api/src/modules/student/student.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { StudentService } from "./student.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

@Controller("students")
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Roles("TEACHER")
  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateStudentDto) {
    return this.studentService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.studentService.findAll(user.tenantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.studentService.findById(user.tenantId, id);
  }

  @Roles("TEACHER")
  @Patch(":id")
  update(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(user.tenantId, id, dto);
  }

  @Roles("TEACHER")
  @Delete(":id")
  delete(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.studentService.delete(user.tenantId, id);
  }

  @Roles("TEACHER")
  @Post(":id/parents")
  addParent(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string, @Body("userId") userId: string) {
    return this.studentService.addParent(user.tenantId, id, userId);
  }

  @Roles("TEACHER")
  @Delete(":id/parents/:userId")
  removeParent(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string, @Param("userId") userId: string) {
    return this.studentService.removeParent(user.tenantId, id, userId);
  }

  @Roles("TEACHER")
  @Post(":id/courses")
  addCourse(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string, @Body("courseId") courseId: string) {
    return this.studentService.addCourse(user.tenantId, id, courseId);
  }

  @Roles("TEACHER")
  @Delete(":id/courses/:courseId")
  removeCourse(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string, @Param("courseId") courseId: string) {
    return this.studentService.removeCourse(user.tenantId, id, courseId);
  }
}
```

- [ ] **Step 6: Create module and register in app.module.ts**

```typescript
// apps/api/src/modules/student/student.module.ts
import { Module } from "@nestjs/common";
import { StudentService } from "./student.service";
import { StudentController } from "./student.controller";

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
```

Add `StudentModule` to `app.module.ts` imports.

- [ ] **Step 7: Run tests**

```bash
cd apps/api && npx jest src/modules/student/student.service.spec.ts --no-cache
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/modules/student/
git commit -m "feat: add student module with CRUD, parent/course linking"
```

---

### Task 4: Course module

Same pattern as Student module but simpler (no parent/course linking).

**Files:**
- Create: `apps/api/src/modules/course/course.module.ts`
- Create: `apps/api/src/modules/course/course.controller.ts`
- Create: `apps/api/src/modules/course/course.service.ts`
- Create: `apps/api/src/modules/course/dto/create-course.dto.ts`
- Create: `apps/api/src/modules/course/dto/update-course.dto.ts`
- Test: `apps/api/src/modules/course/course.service.spec.ts`

- [ ] **Step 1: Write tests, DTOs, service, controller, module**

Follow the same TDD pattern as Task 3. Key differences:
- `CreateCourseDto`: `name` (string, required), `monthlyFee` (number, required), `maxMonthlyReschedules` (number, optional, default 2)
- Service: CRUD with soft delete (`deletedAt`), filter by `tenantId` and `deletedAt: null`
- Controller: All endpoints require `@Roles("TEACHER")`

- [ ] **Step 2: Run tests, register module, verify build**

```bash
cd apps/api && npx jest src/modules/course/ --no-cache && pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/course/
git commit -m "feat: add course module with CRUD and soft delete"
```

---

### Task 5: Parent module

**Files:**
- Create: `apps/api/src/modules/parent/parent.module.ts`
- Create: `apps/api/src/modules/parent/parent.controller.ts`
- Create: `apps/api/src/modules/parent/parent.service.ts`
- Create: `apps/api/src/modules/parent/dto/create-parent.dto.ts`
- Test: `apps/api/src/modules/parent/parent.service.spec.ts`

- [ ] **Step 1: Write tests, DTOs, service, controller, module**

Key behavior:
- `POST /parents`: Teacher creates a parent User with `role: PARENT`, `status: ACTIVE`
- `GET /parents`: List all parents in tenant
- `POST /students/:id/invite`: Generate a LINE invite link. Create an invite token (JWT with studentId + tenantId), encode into a URL like `https://line.me/R/ti/p/@account?token=xxx`. The follow event handler will use this token to link the parent.
- `CreateParentDto`: `name` (required), `email` (optional), `phone` (optional)

- [ ] **Step 2: Run tests, register module, verify build**

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/modules/parent/
git commit -m "feat: add parent module with creation and LINE invite generation"
```

---

### Task 6: Lesson module (slots + sessions + generation)

This is the most complex module. Handles schedule slots, session CRUD, and bulk generation.

**Files:**
- Create: `apps/api/src/modules/lesson/lesson.module.ts`
- Create: `apps/api/src/modules/lesson/lesson.controller.ts`
- Create: `apps/api/src/modules/lesson/lesson.service.ts`
- Create: `apps/api/src/modules/lesson/dto/create-lesson-slot.dto.ts`
- Create: `apps/api/src/modules/lesson/dto/update-lesson-slot.dto.ts`
- Create: `apps/api/src/modules/lesson/dto/generate-sessions.dto.ts`
- Create: `apps/api/src/modules/lesson/dto/create-session.dto.ts`
- Create: `apps/api/src/modules/lesson/dto/update-session.dto.ts`
- Test: `apps/api/src/modules/lesson/lesson.service.spec.ts`

- [ ] **Step 1: Write failing tests for session generation**

Test the core logic: given lesson slots, generate sessions for a month. Test idempotency (running twice creates no duplicates). Test DayOfWeek mapping to actual dates.

```typescript
// Key test cases:
// 1. Generates sessions for each matching weekday in the month
// 2. Skips if session already exists for slot+date (idempotent)
// 3. Returns { created, skipped } counts
// 4. Only processes active slots (deletedAt: null)
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement DTOs**

```typescript
// create-lesson-slot.dto.ts
export class CreateLessonSlotDto {
  @IsUUID() courseId!: string;
  @IsUUID() studentId!: string;
  @IsEnum(DayOfWeek) dayOfWeek!: DayOfWeek;
  @IsString() @Matches(/^\d{2}:\d{2}$/) startTime!: string;
  @IsString() @Matches(/^\d{2}:\d{2}$/) endTime!: string;
}

// generate-sessions.dto.ts
export class GenerateSessionsDto {
  @IsInt() year!: number;
  @IsInt() @Min(1) @Max(12) month!: number;
}
```

- [ ] **Step 4: Implement lesson service**

Key methods:
- `createSlot(tenantId, dto)` — CRUD for LessonSlot
- `generateSessions(tenantId, { year, month })` — bulk generation with idempotency
- `findWeekly(tenantId, weekStartDate)` — sessions for a week
- `findDaily(tenantId, date)` — sessions for a day
- `findAvailableSlots(tenantId, courseId, date range)` — empty time slots for rescheduling
- `getSession(tenantId, sessionId)` — single session detail
- `updateSession(tenantId, sessionId, dto)` — status change (cancel triggers notification)
- `createAdHocSession(tenantId, dto)` — manual session creation

Session generation logic:
```typescript
async generateSessions(tenantId: string, dto: GenerateSessionsDto) {
  const slots = await this.prisma.lessonSlot.findMany({
    where: { tenantId, deletedAt: null },
  });

  const dayMap: Record<string, number> = {
    SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
  };

  let created = 0;
  let skipped = 0;

  for (const slot of slots) {
    const dates = this.getDatesForDayOfWeek(dto.year, dto.month, dayMap[slot.dayOfWeek]);

    for (const date of dates) {
      const existing = await this.prisma.lessonSession.findFirst({
        where: { lessonSlotId: slot.id, date },
      });
      if (existing) { skipped++; continue; }

      await this.prisma.lessonSession.create({
        data: {
          tenantId, lessonSlotId: slot.id,
          studentId: slot.studentId, courseId: slot.courseId,
          date, startTime: slot.startTime, endTime: slot.endTime,
          status: "SCHEDULED",
        },
      });
      created++;
    }
  }
  return { created, skipped };
}

/** Returns Date objects for every occurrence of dayOfWeek in the given month.
 *  Uses UTC to avoid timezone drift — Prisma @db.Date stores date-only values. */
private getDatesForDayOfWeek(year: number, month: number, dayOfWeek: number): Date[] {
  const dates: Date[] = [];
  // Use UTC to avoid timezone-related date shifts
  const date = new Date(Date.UTC(year, month - 1, 1));
  while (date.getUTCDay() !== dayOfWeek) date.setUTCDate(date.getUTCDate() + 1);
  while (date.getUTCMonth() === month - 1) {
    dates.push(new Date(date));
    date.setUTCDate(date.getUTCDate() + 7);
  }
  return dates;
}
```

- [ ] **Step 5: Implement controller and module**

- [ ] **Step 6: Run tests, register module**

```bash
cd apps/api && npx jest src/modules/lesson/ --no-cache && pnpm build
```

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/lesson/
git commit -m "feat: add lesson module with slot CRUD, session generation, and weekly/daily views"
```

---

### Task 7: Attendance module

**Files:**
- Create: `apps/api/src/modules/attendance/attendance.module.ts`
- Create: `apps/api/src/modules/attendance/attendance.controller.ts`
- Create: `apps/api/src/modules/attendance/attendance.service.ts`
- Create: `apps/api/src/modules/attendance/dto/record-attendance.dto.ts`
- Test: `apps/api/src/modules/attendance/attendance.service.spec.ts`

- [ ] **Step 1: Write tests**

Test: record attendance (upsert pattern), get student history, calculate stats (attendanceRate = present / total).

- [ ] **Step 2: Implement service**

Key methods:
- `record(tenantId, dto)` — upsert attendance for a session. Dto: `{ lessonSessionId, studentId, status, note? }`
- `getStudentHistory(tenantId, studentId)` — all attendance records for a student
- `getStudentStats(tenantId, studentId, year, month)` — `{ total, present, absent, late, rate }`
- `getSessionAttendance(tenantId, sessionId)` — attendance for a specific session

- [ ] **Step 3: Implement controller, module, register**

Endpoints:
- `POST /attendance` (TEACHER) — record
- `GET /students/:id/attendance` — history
- `GET /students/:id/attendance/stats` — stats with year/month query params
- `GET /lessons/sessions/:id/attendance` — session attendance

Note: The student-nested routes will be handled by the StudentController or a separate nested controller. For simplicity, put all attendance endpoints under AttendanceController.

- [ ] **Step 4: Run tests, commit**

```bash
git add apps/api/src/modules/attendance/
git commit -m "feat: add attendance module with recording, history, and stats"
```

---

### Task 8: Payment module

**Files:**
- Create: `apps/api/src/modules/payment/payment.module.ts`
- Create: `apps/api/src/modules/payment/payment.controller.ts`
- Create: `apps/api/src/modules/payment/payment.service.ts`
- Create: `apps/api/src/modules/payment/dto/generate-payments.dto.ts`
- Create: `apps/api/src/modules/payment/dto/update-payment.dto.ts`
- Test: `apps/api/src/modules/payment/payment.service.spec.ts`

- [ ] **Step 1: Write tests**

Test: generate monthly payments (one per studentCourse), idempotency (unique constraint), mark as paid, get summary.

- [ ] **Step 2: Implement service**

Key methods:
- `generate(tenantId, { year, month })` — for each active StudentCourse, create Payment with amount from Course.monthlyFee. Skip if already exists (unique constraint).
- `findAll(tenantId, year?, month?)` — list with filters
- `markPaid(tenantId, paymentId)` — set status=PAID, paidAt=now()
- `getSummary(tenantId, year, month)` — `{ total, paid, unpaid, overdue, totalAmount, paidAmount }`

- [ ] **Step 3: Implement controller, module, register**

- [ ] **Step 4: Run tests, commit**

```bash
git add apps/api/src/modules/payment/
git commit -m "feat: add payment module with generation, confirmation, and summary"
```

---

## Phase 3: AI & Reports

### Task 9: AI module (Claude API client)

**Files:**
- Create: `apps/api/src/modules/ai/ai.module.ts`
- Create: `apps/api/src/modules/ai/ai.service.ts`
- Test: `apps/api/src/modules/ai/ai.service.spec.ts`

- [ ] **Step 1: Install Anthropic SDK**

```bash
cd apps/api && pnpm add @anthropic-ai/sdk
```

- [ ] **Step 2: Write tests (mock the API)**

- [ ] **Step 3: Implement AiService**

```typescript
// apps/api/src/modules/ai/ai.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";

@Injectable()
export class AiService {
  private readonly client: Anthropic;
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.getOrThrow("ANTHROPIC_API_KEY"),
    });
  }

  async generateLessonReport(params: {
    teacherMemo: string;
    studentName: string;
    courseName: string;
    genre: string;
  }): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `あなたは${params.genre}教室の先生のアシスタントです。先生が書いたレッスンメモを、保護者向けの温かく丁寧なレポートに変換してください。
ルール:
- 200〜400字
- 前向きなトーン。具体的な改善ポイントも含む
- 絵文字は1〜2個まで
- 生徒の名前を含める
- 挨拶文は不要。レッスン内容から始める`,
      messages: [
        {
          role: "user",
          content: `生徒: ${params.studentName}\nコース: ${params.courseName}\n\n先生のメモ:\n${params.teacherMemo}`,
        },
      ],
    });

    const text = response.content[0];
    if (text.type !== "text") throw new Error("Unexpected response type");
    return text.text;
  }

  async generateMonthlySummary(params: {
    studentName: string;
    courseName: string;
    genre: string;
    year: number;
    month: number;
    attendanceStats: { total: number; present: number; absent: number; late: number };
    lessonMemos: string[];
  }): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: `あなたは${params.genre}教室の先生のアシスタントです。1ヶ月分のレッスンメモと出席データから、保護者向けの月次サマリーを作成してください。
ルール:
- 300〜600字
- 出席データは事実として記載
- メモから進捗を要約
- 来月の目標を1〜2つ提案
- 温かく前向きなトーン`,
      messages: [
        {
          role: "user",
          content: `生徒: ${params.studentName}
コース: ${params.courseName}
期間: ${params.year}年${params.month}月

出席: ${params.attendanceStats.total}回中${params.attendanceStats.present}回出席（遅刻${params.attendanceStats.late}回、欠席${params.attendanceStats.absent}回）

各回のメモ:
${params.lessonMemos.map((m, i) => `${i + 1}回目: ${m}`).join("\n")}`,
        },
      ],
    });

    const text = response.content[0];
    if (text.type !== "text") throw new Error("Unexpected response type");
    return text.text;
  }
}
```

- [ ] **Step 4: Create module, register**

- [ ] **Step 5: Run tests, commit**

```bash
git add apps/api/src/modules/ai/ apps/api/package.json apps/api/pnpm-lock.yaml
git commit -m "feat: add AI module with Claude API for lesson report and monthly summary generation"
```

---

### Task 10: Lesson Note module

**Files:**
- Create: `apps/api/src/modules/lesson-note/lesson-note.module.ts`
- Create: `apps/api/src/modules/lesson-note/lesson-note.controller.ts`
- Create: `apps/api/src/modules/lesson-note/lesson-note.service.ts`
- Create: `apps/api/src/modules/lesson-note/dto/create-lesson-note.dto.ts`
- Create: `apps/api/src/modules/lesson-note/dto/update-lesson-note.dto.ts`
- Test: `apps/api/src/modules/lesson-note/lesson-note.service.spec.ts`

**Module imports:** `LessonNoteModule` must import `AiModule` (for report generation) and `NotificationModule` + `LineModule` (for LINE delivery):
```typescript
@Module({
  imports: [AiModule, NotificationModule, LineModule],
  controllers: [LessonNoteController],
  providers: [LessonNoteService],
  exports: [LessonNoteService],
})
export class LessonNoteModule {}
```

- [ ] **Step 1: Write tests**

Test: create note, generate AI report (calls AiService), edit report, send via LINE (calls NotificationService).

- [ ] **Step 2: Implement service**

Key methods:
- `create(tenantId, dto)` — save teacher memo
- `findByStudent(tenantId, studentId)` — list notes for a student
- `generateReport(tenantId, noteId)` — call AiService, save aiReport, set reportStatus=DRAFT
- `update(tenantId, noteId, dto)` — edit aiReport text
- `send(tenantId, noteId)` — send via LINE to student's parents, set reportStatus=SENT

- [ ] **Step 3: Implement controller, module, register**

- [ ] **Step 4: Run tests, commit**

```bash
git add apps/api/src/modules/lesson-note/
git commit -m "feat: add lesson-note module with AI report generation and LINE delivery"
```

---

### Task 11: Monthly Summary module

**Files:**
- Create: `apps/api/src/modules/monthly-summary/monthly-summary.module.ts`
- Create: `apps/api/src/modules/monthly-summary/monthly-summary.controller.ts`
- Create: `apps/api/src/modules/monthly-summary/monthly-summary.service.ts`
- Test: `apps/api/src/modules/monthly-summary/monthly-summary.service.spec.ts`

**Module imports:** `MonthlySummaryModule` must import `AiModule`, `AttendanceModule`, `NotificationModule`, `LineModule`.

- [ ] **Step 1: Write tests, implement service/controller/module**

Key methods:
- `generate(tenantId, studentId, courseId, year, month)` — gather lesson notes + attendance for the month, call AiService.generateMonthlySummary, save to MonthlySummary
- `findAll(tenantId, year, month)` — list summaries
- `update(tenantId, summaryId, editedSummary)` — edit
- `send(tenantId, summaryId)` — send via LINE

- [ ] **Step 2: Run tests, register, commit**

```bash
git add apps/api/src/modules/monthly-summary/
git commit -m "feat: add monthly-summary module with AI generation and LINE delivery"
```

---

## Phase 4: Reschedule & Absence

### Task 12: Reschedule module

**Files:**
- Create: `apps/api/src/modules/reschedule/reschedule.module.ts`
- Create: `apps/api/src/modules/reschedule/reschedule.controller.ts`
- Create: `apps/api/src/modules/reschedule/reschedule.service.ts`
- Create: `apps/api/src/modules/reschedule/dto/create-reschedule.dto.ts`
- Create: `apps/api/src/modules/reschedule/dto/update-reschedule.dto.ts`
- Test: `apps/api/src/modules/reschedule/reschedule.service.spec.ts`

**Module imports:** `RescheduleModule` must import `NotificationModule` and `LineModule` (to notify teacher of requests, notify parent of results).

- [ ] **Step 1: Write tests**

Test: create request (check monthly limit from Course.maxMonthlyReschedules), approve (creates new session, updates original to RESCHEDULED), reject.

- [ ] **Step 2: Implement service**

Key methods:
- `create(tenantId, userId, dto)` — validate monthly limit, create request with status PENDING, notify teacher
- `findAll(tenantId, status?)` — list requests
- `approve(tenantId, requestId, targetSessionId)` — set status APPROVED, set requestedSessionId, update original session status to RESCHEDULED
- `reject(tenantId, requestId)` — set status REJECTED, notify parent

Monthly limit check:
```typescript
// Get course from the original session
const originalSession = await this.prisma.lessonSession.findUnique({
  where: { id: dto.originalSessionId },
  include: { course: true },
});
if (!originalSession || originalSession.tenantId !== tenantId) {
  throw new NotFoundException("Session not found");
}

const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const count = await this.prisma.rescheduleRequest.count({
  where: {
    studentId: dto.studentId,
    status: "APPROVED",
    createdAt: { gte: monthStart, lt: nextMonthStart },
  },
});
if (count >= originalSession.course.maxMonthlyReschedules) {
  throw new BadRequestException("Monthly reschedule limit reached");
}
```

- [ ] **Step 3: Implement controller, module, register**

- [ ] **Step 4: Run tests, commit**

```bash
git add apps/api/src/modules/reschedule/
git commit -m "feat: add reschedule module with monthly limit enforcement"
```

---

### Task 13: Absence module

**Files:**
- Create: `apps/api/src/modules/absence/absence.module.ts`
- Create: `apps/api/src/modules/absence/absence.controller.ts`
- Create: `apps/api/src/modules/absence/absence.service.ts`
- Create: `apps/api/src/modules/absence/dto/create-absence.dto.ts`
- Test: `apps/api/src/modules/absence/absence.service.spec.ts`

- [ ] **Step 1: Write tests, implement**

Key behavior:
- `POST /absences` — parent submits absence for a session. Sets session status to CANCELLED, creates Attendance with ABSENT, notifies teacher.
- `CreateAbsenceDto`: `{ lessonSessionId: string }`

**Session status state machine:**
```
SCHEDULED → CANCELLED (absence reported, no reschedule)
SCHEDULED → CANCELLED → RESCHEDULED (absence → reschedule approved)
```
The absence module sets CANCELLED. If a reschedule is later approved (Task 12), the reschedule service updates the original session from CANCELLED to RESCHEDULED. This two-step transition is intentional.

- [ ] **Step 2: Register, run tests, commit**

```bash
git add apps/api/src/modules/absence/
git commit -m "feat: add absence module for parent-initiated absence reports"
```

---

## Phase 5: LINE Integration Rewrite

### Task 14: Rewrite LINE webhook and notification service

**Files:**
- Modify: `apps/api/src/modules/line/line-webhook.controller.ts`
- Modify: `apps/api/src/modules/line/line.service.ts`
- Create: `apps/api/src/modules/line/line-message.builder.ts` (rewrite)
- Modify: `apps/api/src/modules/notification/notification.service.ts`
- Modify: `apps/web/app/api/line/webhook/route.ts`

- [ ] **Step 1: Rewrite line-message.builder.ts**

Create Flex Message builders for:
- Lesson report notification
- Lesson reminder
- Reschedule request (teacher-facing)
- Reschedule result (parent-facing)
- Payment reminder
- Absence confirmation with reschedule options

- [ ] **Step 2: Rewrite webhook controller**

Handle postback actions:
```
action=absence&sessionId=xxx
action=reschedule_confirm&sessionId=xxx
action=reschedule_select&sessionId=xxx&targetSessionId=yyy
```

Handle text messages: "欠席" keyword triggers absence flow.

Handle follow event: link parent to student using invite token from URL.

- [ ] **Step 3: Rewrite notification service**

Replace circular notification methods with:
- `sendLessonReport(noteId)` — send Flex Message with report content
- `sendLessonReminder(sessionId)` — simple text reminder
- `sendRescheduleRequest(requestId)` — notify teacher with approve/reject buttons
- `sendRescheduleResult(requestId)` — notify parent of result
- `sendPaymentReminder(paymentId)` — text with amount and due info

- [ ] **Step 4: Add scheduled jobs**

```typescript
// In notification.service.ts or a dedicated scheduler service
// IMPORTANT: All cron jobs must specify timeZone: "Asia/Tokyo" to ensure JST execution
@Cron("0 9 * * *", { timeZone: "Asia/Tokyo" }) // Daily 9:00 JST
async sendDailyReminders() { /* find tomorrow's sessions, send reminders */ }

@Cron("0 9 15 * *", { timeZone: "Asia/Tokyo" }) // 15th of each month 9:00 JST
async sendPaymentReminders() { /* find UNPAID payments, send reminders */ }

@Cron("0 0 1 * *", { timeZone: "Asia/Tokyo" }) // 1st of each month 0:00 JST
async updateOverduePayments() { /* update last month's UNPAID to OVERDUE */ }
```

- [ ] **Step 5: Update Next.js webhook route**

Update `apps/web/app/api/line/webhook/route.ts` to ensure it correctly proxies the new postback data format to the NestJS API. The route structure stays the same (forward to NestJS), but verify the body forwarding works with the new action-based postback data.

- [ ] **Step 6: Test webhook handling manually, commit**

```bash
git add apps/api/src/modules/line/ apps/api/src/modules/notification/ apps/web/app/api/line/
git commit -m "feat: rewrite LINE integration for lesson management (absence, reschedule, reports)"
```

---

## Phase 6: Frontend — Teacher

### Task 15: Teacher layout and navigation

**Files:**
- Create: `apps/web/app/(teacher)/layout.tsx`
- Create: `apps/web/components/layouts/teacher-bottom-nav.tsx`

- [ ] **Step 1: Create bottom navigation component**

Mobile-first bottom nav with 5 items: ホーム, 出欠, 振替, 月謝, 設定. Use Lucide icons. Active state uses brand-600 color.

- [ ] **Step 2: Create teacher layout**

Protected layout: check token, parse JWT, verify role === "TEACHER". Render bottom nav fixed at bottom. Main content area with padding and max-width.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(teacher\)/layout.tsx apps/web/components/layouts/teacher-bottom-nav.tsx
git commit -m "feat: add teacher layout with bottom navigation"
```

---

### Task 16: Teacher home page

**Files:**
- Create: `apps/web/app/(teacher)/page.tsx`

- [ ] **Step 1: Implement home page**

Server component. Fetch today's lessons (`GET /lessons/daily?date=today`). Display as cards: time, student name, course name, status badge. Tap to go to attendance/[sessionId].

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(teacher\)/page.tsx
git commit -m "feat: add teacher home page with today's lessons"
```

---

### Task 17: Student management pages

**Files:**
- Create: `apps/web/app/(teacher)/students/page.tsx`
- Create: `apps/web/app/(teacher)/students/new/page.tsx`
- Create: `apps/web/app/(teacher)/students/[id]/page.tsx`
- Create: `apps/web/app/(teacher)/students/actions.ts`

- [ ] **Step 1: Student list page**

Fetch `GET /students`. Display as list with name, courses, parent link status.

- [ ] **Step 2: New student page**

Form with name, notes. Server action to `POST /students`.

- [ ] **Step 3: Student detail page**

Show student info, linked courses, linked parents, attendance history, lesson notes history. Include "招待リンク生成" button for parent LINE invitation.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\(teacher\)/students/
git commit -m "feat: add student management pages (list, create, detail)"
```

---

### Task 18: Course management page

**Files:**
- Create: `apps/web/app/(teacher)/courses/page.tsx`
- Create: `apps/web/app/(teacher)/courses/actions.ts`

- [ ] **Step 1: Implement course page**

List courses with inline create/edit. Show name, monthly fee, reschedule limit. Use dialog or inline form for create/edit.

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(teacher\)/courses/
git commit -m "feat: add course management page"
```

---

### Task 19: Schedule page

**Files:**
- Create: `apps/web/app/(teacher)/schedule/page.tsx`
- Create: `apps/web/app/(teacher)/schedule/actions.ts`

- [ ] **Step 1: Implement weekly timetable view**

Fetch `GET /lessons/weekly`. Display as grid: days (Mon-Sun) x time slots. Each cell shows student name + course. Include "枠追加" button to create new LessonSlot. Include "セッション生成" button to bulk-generate sessions for a month.

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(teacher\)/schedule/
git commit -m "feat: add weekly schedule page with lesson slot management"
```

---

### Task 20: Attendance pages

**Files:**
- Create: `apps/web/app/(teacher)/attendance/page.tsx`
- Create: `apps/web/app/(teacher)/attendance/[sessionId]/page.tsx`
- Create: `apps/web/app/(teacher)/attendance/actions.ts`

- [ ] **Step 1: Attendance list page**

Show today's (or selected date's) sessions. Each shows student, time, attendance status if already recorded.

- [ ] **Step 2: Session attendance detail page**

Show session info. Large buttons for PRESENT/ABSENT/LATE. Text input for lesson memo. "AIレポート生成" button. Preview of generated report. "LINE送信" button.

This is the **core teacher workflow**: record attendance → write memo → generate report → send.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(teacher\)/attendance/
git commit -m "feat: add attendance recording pages with lesson memo and AI report"
```

---

### Task 21: Reschedule management page

**Files:**
- Create: `apps/web/app/(teacher)/reschedules/page.tsx`
- Create: `apps/web/app/(teacher)/reschedules/actions.ts`

- [ ] **Step 1: Implement reschedule page**

List pending requests. Each shows: student name, original date/time, requested date/time (if selected). Approve/Reject buttons.

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(teacher\)/reschedules/
git commit -m "feat: add reschedule management page for teachers"
```

---

### Task 22: Payment management page

**Files:**
- Create: `apps/web/app/(teacher)/payments/page.tsx`
- Create: `apps/web/app/(teacher)/payments/actions.ts`

- [ ] **Step 1: Implement payment page**

Month selector (year/month). Summary cards: total, paid count, unpaid count, overdue count. Table of payments with status badges. "入金確認" button per row. "一括生成" button to generate payments for selected month.

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(teacher\)/payments/
git commit -m "feat: add payment management page with monthly generation"
```

---

### Task 23: Reports page

**Files:**
- Create: `apps/web/app/(teacher)/reports/page.tsx`
- Create: `apps/web/app/(teacher)/reports/actions.ts`

- [ ] **Step 1: Implement reports page**

Two tabs: "レッスンレポート" and "月次サマリー". Lesson reports: list with status (DRAFT/SENT), edit button, send button. Monthly summaries: generate for a student/month, edit, send.

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(teacher\)/reports/
git commit -m "feat: add reports management page for lesson notes and monthly summaries"
```

---

### Task 24: Teacher settings page

**Files:**
- Create: `apps/web/app/(teacher)/settings/page.tsx`
- Create: `apps/web/app/(teacher)/settings/actions.ts`

- [ ] **Step 1: Implement settings page**

Show: classroom name, genre, LINE connection status. Edit classroom info. Logout button.

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(teacher\)/settings/
git commit -m "feat: add teacher settings page"
```

---

## Phase 7: Frontend — Parent

### Task 25: Parent layout and pages

**Files:**
- Create: `apps/web/app/(parent)/layout.tsx`
- Create: `apps/web/app/(parent)/page.tsx`
- Create: `apps/web/app/(parent)/reports/page.tsx`
- Create: `apps/web/app/(parent)/schedule/page.tsx`
- Create: `apps/web/app/(parent)/absence/page.tsx`
- Create: `apps/web/app/(parent)/absence/actions.ts`
- Create: `apps/web/app/(parent)/payments/page.tsx`

- [ ] **Step 1: Parent layout**

Minimal header with classroom name. No bottom nav (most interaction via LINE). Protected: check token, verify role === "PARENT". Max-width: max-w-lg.

- [ ] **Step 2: Parent home page**

Show child's next lesson, latest report card. Simple and clean.

- [ ] **Step 3: Reports history page**

List of received lesson reports and monthly summaries, ordered by date.

- [ ] **Step 4: Schedule page**

Show upcoming lessons for the parent's children. Simple list view.

- [ ] **Step 5: Absence page**

Select a lesson to report absence. Submit creates absence via `POST /absences`. Option to request reschedule.

- [ ] **Step 6: Payments page**

Show payment history with status badges. Read-only (payments are managed by teacher).

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/\(parent\)/
git commit -m "feat: add parent-facing pages (home, reports, schedule, absence, payments)"
```

---

## Phase 8: Landing Page & Auth Updates

### Task 26: Update landing page and auth

**Files:**
- Modify: `apps/web/app/lp/page.tsx`
- Modify: `apps/web/app/auth/login/page.tsx`
- Modify: `apps/web/app/auth/login/actions.ts`

- [ ] **Step 1: Rewrite landing page**

Update content for まなぶん: headline, features (出欠管理, 振替管理, 月謝管理, AIレポート), CTA for teachers.

- [ ] **Step 2: Update login page**

Update role redirect: TEACHER → /(teacher), PARENT → /(parent). Update branding.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/lp/ apps/web/app/auth/
git commit -m "feat: update landing page and auth for manabun branding"
```

---

## Phase 9: Documentation & Cleanup

### Task 27: Update project documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/prd/002-manabun-mvp.md` (if needed)
- Modify: `.claude/rules/context-map.md`
- Modify: `.claude/rules/api.md`

- [ ] **Step 1: Update CLAUDE.md**

Change project description from "回覧板SaaS" to "個人教室向け運営管理SaaS". Update module references.

- [ ] **Step 2: Update context-map.md**

Update file path → document mappings for new module structure.

- [ ] **Step 3: Verify full build and tests pass**

```bash
pnpm build
cd apps/api && pnpm test
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md .claude/rules/ docs/
git commit -m "docs: update project documentation for manabun pivot"
```
