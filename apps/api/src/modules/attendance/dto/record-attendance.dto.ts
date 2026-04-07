import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { AttendanceStatus } from "@meguru/db";

export class RecordAttendanceDto {
  @IsUUID()
  @IsNotEmpty()
  lessonSessionId!: string;

  @IsUUID()
  @IsNotEmpty()
  studentId!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
