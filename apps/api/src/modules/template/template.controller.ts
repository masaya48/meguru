import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { TemplateService } from "./template.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";

@Roles("ADMIN")
@Controller("templates")
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTemplateDto) {
    return this.templateService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.templateService.findByTenant(user.tenantId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.templateService.findById(user.tenantId, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templateService.update(user.tenantId, id, dto);
  }

  @Delete(":id")
  delete(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.templateService.delete(user.tenantId, id);
  }
}
