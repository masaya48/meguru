import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let prisma: {
    user: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
    tenant: { findUnique: jest.Mock };
  };
  let jwtService: { signAsync: jest.Mock };
  let mailService: { sendMagicLink: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      tenant: {
        findUnique: jest.fn().mockResolvedValue({ id: "t1", name: "テストテナント" }),
      },
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue("jwt-token") };
    mailService = { sendMagicLink: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const map: Record<string, string> = {
                MAGIC_LINK_SECRET: "test-secret",
                APP_URL: "http://localhost:3000",
              };
              return map[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe("register", () => {
    it("creates user with hashed password for admin", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "u1",
        tenantId: "t1",
        role: "ADMIN",
        name: "Admin",
        email: "a@test.com",
      });

      const result = await service.register({
        tenantId: "t1",
        name: "Admin",
        email: "a@test.com",
        password: "password123",
        role: "ADMIN",
      });

      expect(result.accessToken).toBe("jwt-token");
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: "hashed",
            role: "ADMIN",
            status: "ACTIVE",
          }),
        }),
      );
    });

    it("creates user without password (magic link flow)", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "u2",
        tenantId: "t1",
        role: "MEMBER",
        name: "Member",
        email: "m@test.com",
      });

      const result = await service.register({
        tenantId: "t1",
        name: "Member",
        email: "m@test.com",
      });

      expect(result.accessToken).toBe("jwt-token");
    });
  });

  describe("loginWithPassword", () => {
    it("returns token on valid credentials", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.findFirst.mockResolvedValue({
        id: "u1",
        tenantId: "t1",
        role: "ADMIN",
        passwordHash: "hashed",
      });

      const result = await service.loginWithPassword({
        email: "a@test.com",
        password: "password123",
      });

      expect(result.accessToken).toBe("jwt-token");
    });

    it("throws on invalid password", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prisma.user.findFirst.mockResolvedValue({
        id: "u1",
        passwordHash: "hashed",
      });

      await expect(
        service.loginWithPassword({
          email: "a@test.com",
          password: "wrong",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
