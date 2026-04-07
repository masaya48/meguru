import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

@Controller("courses")
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Roles("TEACHER")
  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateCourseDto) {
    return this.courseService.create(user.tenantId, dto);
  }

  @Roles("TEACHER")
  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.courseService.findAll(user.tenantId);
  }

  @Roles("TEACHER")
  @Patch(":id")
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courseService.update(user.tenantId, id, dto);
  }

  @Roles("TEACHER")
  @Delete(":id")
  delete(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.courseService.delete(user.tenantId, id);
  }
}
