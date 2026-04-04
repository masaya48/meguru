import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
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
  findById(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.studentService.findById(user.tenantId, id);
  }

  @Roles("TEACHER")
  @Patch(":id")
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.update(user.tenantId, id, dto);
  }

  @Roles("TEACHER")
  @Delete(":id")
  delete(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.studentService.delete(user.tenantId, id);
  }

  @Roles("TEACHER")
  @Post(":id/parents")
  addParent(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body("userId") userId: string,
  ) {
    return this.studentService.addParent(user.tenantId, id, userId);
  }

  @Roles("TEACHER")
  @Delete(":id/parents/:userId")
  removeParent(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Param("userId") userId: string,
  ) {
    return this.studentService.removeParent(user.tenantId, id, userId);
  }

  @Roles("TEACHER")
  @Post(":id/courses")
  addCourse(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body("courseId") courseId: string,
  ) {
    return this.studentService.addCourse(user.tenantId, id, courseId);
  }

  @Roles("TEACHER")
  @Delete(":id/courses/:courseId")
  removeCourse(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Param("courseId") courseId: string,
  ) {
    return this.studentService.removeCourse(user.tenantId, id, courseId);
  }
}
