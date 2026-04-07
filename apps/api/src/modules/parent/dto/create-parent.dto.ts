import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail } from "class-validator";

export class CreateParentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
