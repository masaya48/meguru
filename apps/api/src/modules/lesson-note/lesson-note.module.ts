import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { LineModule } from "../line/line.module";
import { LessonNoteService } from "./lesson-note.service";
import { LessonNoteController } from "./lesson-note.controller";

@Module({
  imports: [AiModule, LineModule],
  controllers: [LessonNoteController],
  providers: [LessonNoteService],
  exports: [LessonNoteService],
})
export class LessonNoteModule {}
