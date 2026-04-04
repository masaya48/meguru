import { IsEnum, IsOptional } from "class-validator";
import { SessionStatus } from "@meguru/db";

export class UpdateSessionDto {
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;
}
