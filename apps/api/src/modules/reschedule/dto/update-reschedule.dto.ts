import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { RescheduleStatus } from "@meguru/db";

export class UpdateRescheduleDto {
  @IsEnum(RescheduleStatus)
  status!: RescheduleStatus;

  @IsUUID()
  @IsOptional()
  requestedSessionId?: string;
}
