import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { TenantService } from "./tenant.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";

@Controller("tenants")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantService.create(dto);
  }

  @Public()
  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.tenantService.findBySlug(slug);
  }
}
