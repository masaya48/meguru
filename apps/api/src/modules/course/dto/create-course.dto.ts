import { IsString, IsNotEmpty, MaxLength, IsInt, IsOptional, Min } from "class-validator";

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsInt()
  @Min(0)
  monthlyFee!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxMonthlyReschedules?: number;
}
