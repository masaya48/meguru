import { Controller, Get, Param, Post } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ReadService } from "./read.service";

@Controller("circulars/:circularId/reads")
export class ReadController {
  constructor(private readonly readService: ReadService) {}

  /** 住民: 既読を記録 */
  @Post()
  markAsRead(@CurrentUser() user: CurrentUserPayload, @Param("circularId") circularId: string) {
    return this.readService.markAsRead(user.tenantId, circularId, user.userId);
  }

  /** 管理者: 既読一覧 */
  @Roles("ADMIN")
  @Get()
  getReadStatus(@CurrentUser() user: CurrentUserPayload, @Param("circularId") circularId: string) {
    return this.readService.getReadStatus(user.tenantId, circularId);
  }
}
