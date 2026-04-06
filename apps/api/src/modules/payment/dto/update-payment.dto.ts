import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { PaymentStatus } from "@meguru/db";

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
