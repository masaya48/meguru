import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RequestMagicLinkDto } from "./dto/magic-link.dto";
import { MailService } from "../mail/mail.service";
import * as crypto from "node:crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { tenantId: dto.tenantId, email: dto.email },
    });
    if (existing) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null;

    const user = await this.prisma.user.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role ?? "PARENT",
        status: "ACTIVE",
      },
    });

    const accessToken = await this.generateToken(user);
    return { accessToken, user: { id: user.id, name: user.name, role: user.role } };
  }

  async loginWithPassword(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, status: "ACTIVE" },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = await this.generateToken(user);
    return { accessToken, user: { id: user.id, name: user.name, role: user.role } };
  }

  async requestMagicLink(dto: RequestMagicLinkDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { tenantId: dto.tenantId, email: dto.email, status: "ACTIVE" },
    });
    if (!user) {
      // Don't reveal whether user exists
      return { message: "If an account exists, a login link has been sent" };
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const secret = this.configService.getOrThrow<string>("MAGIC_LINK_SECRET");
    const payload = { userId: user.id, tenantId: user.tenantId, token };
    const magicToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: "15m",
    });

    const appUrl = this.configService.getOrThrow<string>("APP_URL");
    const link = `${appUrl}/auth/verify?token=${magicToken}`;

    await this.mailService.sendMagicLink(user.email!, link, tenant?.name ?? undefined);

    return { message: "If an account exists, a login link has been sent" };
  }

  async verifyMagicLink(token: string) {
    const secret = this.configService.getOrThrow<string>("MAGIC_LINK_SECRET");
    try {
      const payload = await this.jwtService.verifyAsync<{
        userId: string;
        tenantId: string;
      }>(token, { secret });

      const user = await this.prisma.user.findFirst({
        where: { id: payload.userId, tenantId: payload.tenantId, status: "ACTIVE" },
      });
      if (!user) throw new UnauthorizedException("User not found");

      const accessToken = await this.generateToken(user);
      return { accessToken, user: { id: user.id, name: user.name, role: user.role } };
    } catch {
      throw new UnauthorizedException("Invalid or expired magic link");
    }
  }

  private async generateToken(user: {
    id: string;
    tenantId: string;
    role: string;
  }): Promise<string> {
    return this.jwtService.signAsync({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });
  }
}
