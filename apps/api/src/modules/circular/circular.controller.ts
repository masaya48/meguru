import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CircularService } from "./circular.service";
import { CreateCircularDto } from "./dto/create-circular.dto";
import { UpdateCircularDto } from "./dto/update-circular.dto";

@Controller("circulars")
export class CircularController {
  constructor(private readonly circularService: CircularService) {}

  /** 管理者: 回覧作成 */
  @Roles("ADMIN")
  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateCircularDto) {
    return this.circularService.create(user.tenantId, user.userId, dto);
  }

  /** 回覧一覧（住民: PUBLISHED のみ / 管理者: 全て） */
  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload, @Query("status") status?: string) {
    const effectiveStatus = user.role === "ADMIN" ? status : "PUBLISHED";
    return this.circularService.findByTenant(user.tenantId, effectiveStatus);
  }

  /** 回覧詳細 */
  @Get(":id")
  findOne(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.circularService.findById(user.tenantId, id);
  }

  /** 管理者: 回覧の統計情報 */
  @Roles("ADMIN")
  @Get(":id/stats")
  getStats(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.circularService.getStats(user.tenantId, id);
  }

  /** 管理者: 回覧編集（下書きのみ） */
  @Roles("ADMIN")
  @Patch(":id")
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: UpdateCircularDto,
  ) {
    return this.circularService.update(user.tenantId, id, dto);
  }

  /** 管理者: 回覧配信 */
  @Roles("ADMIN")
  @Post(":id/publish")
  publish(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.circularService.publish(user.tenantId, id);
  }

  /** 管理者: 回覧終了 */
  @Roles("ADMIN")
  @Post(":id/close")
  close(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.circularService.close(user.tenantId, id);
  }

  /** 管理者: 回覧削除（下書きのみ） */
  @Roles("ADMIN")
  @Delete(":id")
  delete(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.circularService.delete(user.tenantId, id);
  }
}
