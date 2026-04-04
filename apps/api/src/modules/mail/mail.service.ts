import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get("MAIL_HOST", "localhost"),
      port: this.configService.get<number>("MAIL_PORT", 1025),
      secure: false,
      // No auth needed for MailHog in dev
      ...(this.configService.get("MAIL_USER")
        ? {
            auth: {
              user: this.configService.get("MAIL_USER"),
              pass: this.configService.get("MAIL_PASS"),
            },
          }
        : {}),
    });
  }

  async sendMagicLink(to: string, link: string, tenantName?: string) {
    const subject = tenantName
      ? `【${tenantName}】ログインリンク — めぐる`
      : "ログインリンク — めぐる";

    await this.transporter.sendMail({
      from: this.configService.get("MAIL_FROM", '"めぐる" <noreply@meguru.app>'),
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2D6A4F;">めぐる</h2>
          <p>以下のリンクをクリックしてログインしてください。</p>
          <p style="margin: 24px 0;">
            <a href="${link}" style="display: inline-block; background: #2D6A4F; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              ログインする
            </a>
          </p>
          <p style="color: #6B7280; font-size: 14px;">
            このリンクは15分間有効です。<br>
            心当たりがない場合は、このメールを無視してください。
          </p>
        </div>
      `,
    });

    this.logger.log(`Magic link email sent to ${to}`);
  }
}
