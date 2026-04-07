import { Module } from "@nestjs/common";
import { AbsenceService } from "./absence.service";
import { AbsenceController } from "./absence.controller";

@Module({
  controllers: [AbsenceController],
  providers: [AbsenceService],
  exports: [AbsenceService],
})
export class AbsenceModule {}
