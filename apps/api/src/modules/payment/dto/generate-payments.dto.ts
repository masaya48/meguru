import { IsInt, Min, Max } from "class-validator";

export class GeneratePaymentsDto {
  @IsInt()
  year!: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;
}
