import { IsEmail, IsString, IsUUID } from "class-validator";

export class RequestMagicLinkDto {
  @IsEmail()
  email!: string;

  @IsUUID()
  tenantId!: string;
}

export class VerifyMagicLinkDto {
  @IsString()
  token!: string;
}
