import { IsDateString, IsString, IsUUID, Matches } from "class-validator";

export class CreateSessionDto {
  @IsUUID()
  studentId!: string;

  @IsUUID()
  courseId!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "startTime must be in HH:mm format" })
  startTime!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "endTime must be in HH:mm format" })
  endTime!: string;
}
