import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateAbsenceDto {
  @IsUUID()
  @IsNotEmpty()
  lessonSessionId!: string;
}
