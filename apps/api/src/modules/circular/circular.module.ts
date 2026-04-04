import { Module } from "@nestjs/common";
import { CircularService } from "./circular.service";
import { CircularController } from "./circular.controller";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [NotificationModule],
  controllers: [CircularController],
  providers: [CircularService],
  exports: [CircularService],
})
export class CircularModule {}
