import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { LineModule } from "../line/line.module";
import { AttendanceModule } from "../attendance/attendance.module";
import { MonthlySummaryService } from "./monthly-summary.service";
import { MonthlySummaryController } from "./monthly-summary.controller";

@Module({
  imports: [AiModule, LineModule, AttendanceModule],
  controllers: [MonthlySummaryController],
  providers: [MonthlySummaryService],
  exports: [MonthlySummaryService],
})
export class MonthlySummaryModule {}
