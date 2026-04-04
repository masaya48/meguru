import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { ParentService } from "./parent.service";
import { CreateParentDto } from "./dto/create-parent.dto";

@Controller()
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Roles("TEACHER")
  @Post("parents")
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateParentDto) {
    return this.parentService.create(user.tenantId, dto);
  }

  @Roles("TEACHER")
  @Get("parents")
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.parentService.findAll(user.tenantId);
  }

  @Roles("TEACHER")
  @Post("students/:id/invite")
  generateInviteLink(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.parentService.generateInviteLink(user.tenantId, id);
  }
}
