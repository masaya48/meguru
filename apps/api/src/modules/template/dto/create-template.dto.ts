import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from "class-validator";
import { CircularType } from "@meguru/db";

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsNotEmpty()
  bodyTemplate!: string;

  @IsEnum(CircularType)
  type!: CircularType;

  @IsOptional()
  questions?: unknown;
}
