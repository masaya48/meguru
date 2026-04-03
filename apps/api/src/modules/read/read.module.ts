import { Module } from "@nestjs/common";
import { ReadService } from "./read.service";
import { ReadController } from "./read.controller";

@Module({
  controllers: [ReadController],
  providers: [ReadService],
  exports: [ReadService],
})
export class ReadModule {}
