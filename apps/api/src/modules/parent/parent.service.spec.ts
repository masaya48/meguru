import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ParentService } from "./parent.service";
import { PrismaService } from "../prisma/prisma.service";

describe("ParentService", () => {
  let service: ParentService;
  let prisma: {
    user: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock };
  let configService: { getOrThrow: jest.Mock };

  const tenantId = "tenant-uuid-1";

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    jwtService = { sign: jest.fn() };
    configService = { getOrThrow: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<ParentService>(ParentService);
  });

  describe("create", () => {
    it("creates a user with PARENT role and ACTIVE status", async () => {
      const dto = { name: "山田花子", email: "hanako@example.com", phone: "090-1234-5678" };
      const expected = { id: "uuid-1", tenantId, role: "PARENT", status: "ACTIVE", ...dto };
      prisma.user.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);
      expect(result).toEqual(expected);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          tenantId,
          name: "山田花子",
          email: "hanako@example.com",
          phone: "090-1234-5678",
          role: "PARENT",
          status: "ACTIVE",
        },
      });
    });
  });

  describe("findAll", () => {
    it("lists all users with PARENT role including studentParents", async () => {
      const parents = [
        {
          id: "uuid-1",
          tenantId,
          name: "山田花子",
          role: "PARENT",
          studentParents: [{ student: { id: "student-1", name: "山田太郎" } }],
        },
      ];
      prisma.user.findMany.mockResolvedValue(parents);

      const result = await service.findAll(tenantId);
      expect(result).toEqual(parents);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { tenantId, role: "PARENT" },
        include: {
          studentParents: { include: { student: true } },
        },
      });
    });
  });

  describe("generateInviteLink", () => {
    it("generates a JWT token and returns an invite URL", async () => {
      const studentId = "student-uuid-1";
      const token = "signed.jwt.token";
      const appUrl = "https://app.example.com";

      jwtService.sign.mockReturnValue(token);
      configService.getOrThrow.mockReturnValue(appUrl);

      const result = await service.generateInviteLink(tenantId, studentId);

      expect(result).toEqual({ inviteUrl: `${appUrl}/line/invite?token=${token}` });
      expect(jwtService.sign).toHaveBeenCalledWith({ tenantId, studentId }, { expiresIn: "7d" });
      expect(configService.getOrThrow).toHaveBeenCalledWith("APP_URL");
    });
  });
});
