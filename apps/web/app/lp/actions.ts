"use server";

import nodemailer from "nodemailer";

interface ContactFormState {
  success: boolean;
  error?: string;
}

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = formData.get("name") as string;
  const organizationName = formData.get("organizationName") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { success: false, error: "必須項目を入力してください" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "localhost",
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: false,
    });

    const contactEmail = process.env.CONTACT_EMAIL ?? "contact@meguru.app";

    await transporter.sendMail({
      from: `"めぐる お問い合わせ" <noreply@meguru.app>`,
      to: contactEmail,
      subject: `【めぐる】お問い合わせ: ${name}様 (${organizationName || "未入力"})`,
      text: [
        `お名前: ${name}`,
        `自治会名: ${organizationName || "未入力"}`,
        `メールアドレス: ${email}`,
        ``,
        `メッセージ:`,
        message,
      ].join("\n"),
    });

    return { success: true };
  } catch (e) {
    console.error("Contact form email failed:", e);
    return { success: false, error: "送信に失敗しました。しばらくしてからお試しください。" };
  }
}
