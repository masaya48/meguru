import { IsString, IsNotEmpty, MaxLength, IsInt, IsOptional } from "class-validator";

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
