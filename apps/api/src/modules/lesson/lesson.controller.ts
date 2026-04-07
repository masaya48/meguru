import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { LessonService } from "./lesson.service";
import { CreateLessonSlotDto } from "./dto/create-lesson-slot.dto";
import { UpdateLessonSlotDto } from "./dto/update-lesson-slot.dto";
import { GenerateSessionsDto } from "./dto/generate-sessions.dto";
import { CreateSessionDto } from "./dto/create-session.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";

@Controller("lessons")
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  // ─── Slots ───────────────────────────────────────────────

  @Roles("TEACHER")
  @Post("slots")
  createSlot(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateLessonSlotDto) {
    return this.lessonService.createSlot(user.tenantId, dto);
  }

  @Get("slots")
  findSlots(@CurrentUser() user: CurrentUserPayload) {
    return this.lessonService.findSlots(user.tenantId);
  }

  @Roles("TEACHER")
  @Patch("slots/:id")
  updateSlot(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: UpdateLessonSlotDto,
  ) {
    return this.lessonService.updateSlot(user.tenantId, id, dto);
  }

  @Roles("TEACHER")
  @Delete("slots/:id")
  deleteSlot(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.lessonService.deleteSlot(user.tenantId, id);
  }

  // ─── Session Generation ──────────────────────────────────

  @Roles("TEACHER")
  @Post("generate")
  generateSessions(@CurrentUser() user: CurrentUserPayload, @Body() dto: GenerateSessionsDto) {
    return this.lessonService.generateSessions(user.tenantId, dto);
  }

  // ─── Session Queries ─────────────────────────────────────

  @Get("weekly")
  findWeekly(@CurrentUser() user: CurrentUserPayload, @Query("date") dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.lessonService.findWeekly(user.tenantId, date);
  }

  @Get("daily")
  findDaily(@CurrentUser() user: CurrentUserPayload, @Query("date") dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    return this.lessonService.findDaily(user.tenantId, date);
  }

  @Get("available-slots")
  findAvailableSlots(
    @CurrentUser() user: CurrentUserPayload,
    @Query("courseId") courseId?: string,
    @Query("startDate") startDateStr?: string,
    @Query("endDate") endDateStr?: string,
  ) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    const endDate = endDateStr
      ? new Date(endDateStr)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.lessonService.findAvailableSlots(user.tenantId, courseId, startDate, endDate);
  }

  // ─── Session CRUD ────────────────────────────────────────

  @Get("sessions/:id")
  getSession(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.lessonService.getSession(user.tenantId, id);
  }

  @Roles("TEACHER")
  @Patch("sessions/:id")
  updateSession(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.lessonService.updateSession(user.tenantId, id, dto);
  }

  @Roles("TEACHER")
  @Post("sessions")
  createAdHocSession(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateSessionDto) {
    return this.lessonService.createAdHocSession(user.tenantId, dto);
  }
}
