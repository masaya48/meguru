import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
  IsUUID,
} from "class-validator";
import { Role } from "@meguru/db";

export class RegisterDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
