import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CircularType, TargetType, QuestionType } from "@meguru/db";

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  questionText!: string;

  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  sortOrder?: number;
}

export class CreateCircularDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsEnum(CircularType)
  type!: CircularType;

  @IsEnum(TargetType)
  @IsOptional()
  targetType?: TargetType;

  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  targetGroupIds?: string[];

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[];
}
