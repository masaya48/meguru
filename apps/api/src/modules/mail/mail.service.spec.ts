import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { MailService } from "./mail.service";
import * as nodemailer from "nodemailer";

jest.mock("nodemailer");

describe("MailService", () => {
  let service: MailService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue({ messageId: "test-id" });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) => {
              const map: Record<string, unknown> = {
                MAIL_HOST: "localhost",
                MAIL_PORT: 1025,
                MAIL_FROM: '"めぐる" <noreply@meguru.app>',
              };
              return map[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("calls transporter.sendMail with correct args for sendMagicLink", async () => {
    await service.sendMagicLink("user@example.com", "http://localhost:3000/auth/verify?token=abc");

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "ログインリンク — めぐる",
        from: '"めぐる" <noreply@meguru.app>',
        html: expect.stringContaining("http://localhost:3000/auth/verify?token=abc"),
      }),
    );
  });

  it("includes tenant name in subject when provided", async () => {
    await service.sendMagicLink(
      "user@example.com",
      "http://localhost:3000/auth/verify?token=abc",
      "テストテナント",
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "【テストテナント】ログインリンク — めぐる",
      }),
    );
  });

  it("creates transporter without auth when MAIL_USER is not set", () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "localhost",
        port: 1025,
        secure: false,
      }),
    );
    // No auth property should be present
    const callArgs = (nodemailer.createTransport as jest.Mock).mock.calls[0][0];
    expect(callArgs.auth).toBeUndefined();
  });
});
