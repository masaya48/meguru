import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { RescheduleService } from "./reschedule.service";
import { CreateRescheduleDto } from "./dto/create-reschedule.dto";
import { UpdateRescheduleDto } from "./dto/update-reschedule.dto";
import { RescheduleStatus } from "@meguru/db";

@Controller("reschedules")
export class RescheduleController {
  constructor(private readonly rescheduleService: RescheduleService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateRescheduleDto) {
    return this.rescheduleService.create(user.tenantId, user.userId, dto);
  }

  @Roles("TEACHER")
  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload, @Query("status") status?: RescheduleStatus) {
    return this.rescheduleService.findAll(user.tenantId, status);
  }

  @Roles("TEACHER")
  @Patch(":id")
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: UpdateRescheduleDto,
  ) {
    if (dto.status === RescheduleStatus.APPROVED) {
      return this.rescheduleService.approve(user.tenantId, id, dto.requestedSessionId!);
    }
    return this.rescheduleService.reject(user.tenantId, id);
  }
}
