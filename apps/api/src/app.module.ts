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
import { StudentModule } from "./modules/student/student.module";
import { CourseModule } from "./modules/course/course.module";
import { ParentModule } from "./modules/parent/parent.module";
import { LessonModule } from "./modules/lesson/lesson.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { AiModule } from "./modules/ai/ai.module";
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
    StudentModule,
    CourseModule,
    ParentModule,
    LessonModule,
    AttendanceModule,
    PaymentModule,
    AiModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
