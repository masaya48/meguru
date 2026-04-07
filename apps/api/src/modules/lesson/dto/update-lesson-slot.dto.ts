import { PartialType } from "@nestjs/mapped-types";
import { CreateLessonSlotDto } from "./create-lesson-slot.dto";

export class UpdateLessonSlotDto extends PartialType(CreateLessonSlotDto) {}
