import { IsString, IsNotEmpty, MaxLength, Matches, IsEnum, IsOptional } from "class-validator";
import { Genre } from "@meguru/db";

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: "slug must contain only lowercase letters, numbers, and hyphens",
  })
  slug!: string;

  @IsEnum(Genre)
  @IsOptional()
  genre?: Genre;
}
