import { Module } from "@nestjs/common";
import { CircularService } from "./circular.service";
import { CircularController } from "./circular.controller";

@Module({
  controllers: [CircularController],
  providers: [CircularService],
  exports: [CircularService],
})
export class CircularModule {}
