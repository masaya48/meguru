import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { GroupService } from "./group.service";
import { CreateGroupDto } from "./dto/create-group.dto";

@Controller("groups")
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.groupService.findByTenant(user.tenantId);
  }

  @Roles("ADMIN")
  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateGroupDto) {
    return this.groupService.create(user.tenantId, dto);
  }

  @Roles("ADMIN")
  @Delete(":id")
  delete(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.groupService.delete(user.tenantId, id);
  }
}
