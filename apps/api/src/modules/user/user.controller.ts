import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.userService.findByTenant(user.tenantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.userService.findById(user.tenantId, id);
  }

  @Roles("ADMIN")
  @Patch(":id")
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(user.tenantId, id, dto);
  }

  @Roles("ADMIN")
  @Post(":id/approve")
  approve(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.userService.approve(user.tenantId, id);
  }
}
