import { IsString, IsNotEmpty, MaxLength, IsOptional } from "class-validator";

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
