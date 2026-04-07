import { Body, Controller, Post } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { AbsenceService } from "./absence.service";
import { CreateAbsenceDto } from "./dto/create-absence.dto";

@Controller("absences")
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateAbsenceDto) {
    return this.absenceService.create(user.tenantId, user.userId, dto);
  }
}
