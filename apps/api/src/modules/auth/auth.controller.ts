import { Body, Controller, Post, Query } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RequestMagicLinkDto } from "./dto/magic-link.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.loginWithPassword(dto);
  }

  @Public()
  @Post("magic-link")
  requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    return this.authService.requestMagicLink(dto);
  }

  @Public()
  @Post("verify")
  verifyMagicLink(@Query("token") token: string) {
    return this.authService.verifyMagicLink(token);
  }
}
