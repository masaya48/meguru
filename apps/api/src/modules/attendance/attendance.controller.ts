import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { AttendanceService } from "./attendance.service";
import { RecordAttendanceDto } from "./dto/record-attendance.dto";

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles("TEACHER")
  @Post("attendance")
  record(@CurrentUser() user: CurrentUserPayload, @Body() dto: RecordAttendanceDto) {
    return this.attendanceService.record(user.tenantId, dto);
  }

  @Get("students/:id/attendance")
  getStudentHistory(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.attendanceService.getStudentHistory(user.tenantId, id);
  }

  @Get("students/:id/attendance/stats")
  getStudentStats(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Query("year") year: string,
    @Query("month") month: string,
  ) {
    return this.attendanceService.getStudentStats(user.tenantId, id, Number(year), Number(month));
  }

  @Get("lessons/sessions/:id/attendance")
  getSessionAttendance(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.attendanceService.getSessionAttendance(user.tenantId, id);
  }
}
