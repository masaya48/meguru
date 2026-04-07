import { IsString, IsOptional } from "class-validator";

export class UpdateLessonNoteDto {
  @IsString()
  @IsOptional()
  aiReport?: string;
}
