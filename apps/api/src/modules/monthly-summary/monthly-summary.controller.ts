import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { MonthlySummaryService } from "./monthly-summary.service";

@Controller("monthly-summaries")
export class MonthlySummaryController {
  constructor(private readonly monthlySummaryService: MonthlySummaryService) {}

  @Roles("TEACHER")
  @Post("generate")
  generate(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { studentId: string; courseId: string; year: number; month: number },
  ) {
    return this.monthlySummaryService.generate(
      user.tenantId,
      body.studentId,
      body.courseId,
      body.year,
      body.month,
    );
  }

  @Roles("TEACHER")
  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query("year") year: string,
    @Query("month") month: string,
  ) {
    return this.monthlySummaryService.findAll(user.tenantId, Number(year), Number(month));
  }

  @Roles("TEACHER")
  @Patch(":id")
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") summaryId: string,
    @Body() body: { editedSummary: string },
  ) {
    return this.monthlySummaryService.update(user.tenantId, summaryId, body.editedSummary);
  }

  @Roles("TEACHER")
  @Post(":id/send")
  send(@CurrentUser() user: CurrentUserPayload, @Param("id") summaryId: string) {
    return this.monthlySummaryService.send(user.tenantId, summaryId);
  }
}
