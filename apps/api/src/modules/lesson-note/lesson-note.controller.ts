import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { LessonNoteService } from "./lesson-note.service";
import { CreateLessonNoteDto } from "./dto/create-lesson-note.dto";
import { UpdateLessonNoteDto } from "./dto/update-lesson-note.dto";

@Controller()
export class LessonNoteController {
  constructor(private readonly lessonNoteService: LessonNoteService) {}

  @Roles("TEACHER")
  @Post("lesson-notes")
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateLessonNoteDto) {
    return this.lessonNoteService.create(user.tenantId, dto);
  }

  @Get("students/:id/lesson-notes")
  findByStudent(@CurrentUser() user: CurrentUserPayload, @Param("id") studentId: string) {
    return this.lessonNoteService.findByStudent(user.tenantId, studentId);
  }

  @Roles("TEACHER")
  @Post("lesson-notes/:id/generate-report")
  generateReport(@CurrentUser() user: CurrentUserPayload, @Param("id") noteId: string) {
    return this.lessonNoteService.generateReport(user.tenantId, noteId);
  }

  @Roles("TEACHER")
  @Patch("lesson-notes/:id")
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") noteId: string,
    @Body() dto: UpdateLessonNoteDto,
  ) {
    return this.lessonNoteService.update(user.tenantId, noteId, dto);
  }

  @Roles("TEACHER")
  @Post("lesson-notes/:id/send")
  send(@CurrentUser() user: CurrentUserPayload, @Param("id") noteId: string) {
    return this.lessonNoteService.send(user.tenantId, noteId);
  }
}
