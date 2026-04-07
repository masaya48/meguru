import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PaymentService } from "./payment.service";
import { GeneratePaymentsDto } from "./dto/generate-payments.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Roles("TEACHER")
  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query("year") year?: string,
    @Query("month") month?: string,
  ) {
    return this.paymentService.findAll(
      user.tenantId,
      year !== undefined ? parseInt(year, 10) : undefined,
      month !== undefined ? parseInt(month, 10) : undefined,
    );
  }

  @Roles("TEACHER")
  @Post("generate")
  generate(@CurrentUser() user: CurrentUserPayload, @Body() dto: GeneratePaymentsDto) {
    return this.paymentService.generate(user.tenantId, dto);
  }

  @Roles("TEACHER")
  @Get("summary")
  getSummary(
    @CurrentUser() user: CurrentUserPayload,
    @Query("year") year: string,
    @Query("month") month: string,
  ) {
    return this.paymentService.getSummary(user.tenantId, parseInt(year, 10), parseInt(month, 10));
  }

  @Roles("TEACHER")
  @Patch(":id")
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(user.tenantId, id, dto);
  }
}
