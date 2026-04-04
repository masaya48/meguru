import { IsString, IsNotEmpty, IsUUID } from "class-validator";

export class CreateLessonNoteDto {
  @IsUUID()
  @IsNotEmpty()
  lessonSessionId!: string;

  @IsUUID()
  @IsNotEmpty()
  studentId!: string;

  @IsString()
  @IsNotEmpty()
  teacherMemo!: string;
}
