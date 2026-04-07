import { IsEnum, IsString, IsUUID, Matches } from "class-validator";
import { DayOfWeek } from "@meguru/db";

export class CreateLessonSlotDto {
  @IsUUID()
  courseId!: string;

  @IsUUID()
  studentId!: string;

  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "startTime must be in HH:mm format" })
  startTime!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "endTime must be in HH:mm format" })
  endTime!: string;
}
