import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { AnswerService } from "./answer.service";
import { SubmitAnswerDto } from "./dto/submit-answer.dto";

@Controller("circulars/:circularId/answers")
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  /** 住民: 回答を送信 */
  @Post()
  submit(
    @CurrentUser() user: CurrentUserPayload,
    @Param("circularId") _circularId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.answerService.submit(user.tenantId, user.userId, dto);
  }

  /** 管理者: 回覧の全回答一覧 */
  @Roles("ADMIN")
  @Get()
  getByCircular(@Param("circularId") circularId: string) {
    return this.answerService.getByCircular(circularId);
  }

  /** 住民: 自分の回答一覧 */
  @Get("mine")
  getMyAnswers(@CurrentUser() user: CurrentUserPayload, @Param("circularId") circularId: string) {
    return this.answerService.getMyAnswers(user.userId, circularId);
  }
}
