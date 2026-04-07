import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateRescheduleDto {
  @IsUUID()
  @IsNotEmpty()
  originalSessionId!: string;

  @IsUUID()
  @IsNotEmpty()
  studentId!: string;
}
