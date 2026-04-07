import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  RefreshCcw,
  CreditCard,
  Sparkles,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "まなぶん — 個人教室の運営をもっとかんたんに",
  description:
    "出欠管理・振替管理・月謝管理・AIレッスンレポートをひとつのアプリで。個人教室の先生のための運営管理サービスです。",
  openGraph: {
    title: "まなぶん — 個人教室の運営をもっとかんたんに",
    description:
      "出欠管理・振替管理・月謝管理・AIレッスンレポートをひとつのアプリで。個人教室の先生のための運営管理サービスです。",
  },
};

/* ─── Phone Mockup ─── */
function PhoneMockup() {
  return (
    <div className="mx-auto w-[220px] rounded-[28px] border-4 border-gray-800 bg-gray-800 p-1 shadow-2xl sm:w-[260px]">
      {/* Notch */}
      <div className="mx-auto mb-1 h-4 w-20 rounded-b-xl bg-gray-800" />
      {/* Screen */}
      <div className="overflow-hidden rounded-[20px] bg-white">
        {/* Header */}
        <div className="bg-brand-800 px-4 py-3 text-sm font-bold text-white">まなぶん</div>
        {/* Content */}
        <div className="space-y-2.5 p-3">
          {/* Today's lesson */}
          <div className="rounded-lg border-l-4 border-brand-500 bg-brand-50 p-3">
            <p className="text-xs font-bold text-brand-600 mb-1">今日のレッスン</p>
            <p className="text-sm font-medium text-ink">山田 花子さん</p>
            <p className="mt-0.5 text-xs text-ink-light">15:00 - 16:00 / ピアノ基礎</p>
          </div>
          {/* Report sent */}
          <div className="rounded-lg border-l-4 border-green-400 bg-green-50 p-3">
            <p className="text-xs font-bold text-green-600 mb-1">レポート送信済み</p>
            <p className="text-sm font-medium text-ink">田中 太郎さん</p>
            <p className="mt-0.5 text-xs text-ink-light">AIレポート作成 ✓</p>
          </div>
          {/* Payment */}
          <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-3">
            <p className="text-xs font-bold text-yellow-700 mb-1">月謝未納</p>
            <p className="text-sm font-medium text-ink">鈴木 二郎さん</p>
            <p className="mt-0.5 text-xs text-ink-light">4月分 ¥8,000</p>
          </div>
        </div>
      </div>
      {/* Home indicator */}
      <div className="mx-auto mt-1 h-1 w-16 rounded-full bg-gray-500" />
    </div>
  );
}

/* ─── FAQ Item ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-gray-200 bg-white">
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium text-ink sm:text-lg">
        <span>{q}</span>
        <ChevronDown className="size-5 shrink-0 text-ink-light transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-5 text-base leading-relaxed text-ink-light">{a}</div>
    </details>
  );
}

/* ─── Main Page ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      {/* ━━━ Hero ━━━ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 lg:flex-row lg:gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6 flex items-center justify-center gap-2 lg:justify-start">
              <LogoMark size={40} />
              <span className="font-logo text-2xl font-bold tracking-wide text-brand-800">
                まなぶん
              </span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
              個人教室の運営を
              <br />
              もっとかんたんに
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-light sm:text-xl">
              まなぶんは、個人教室の先生のための運営管理サービスです。
              <br className="hidden sm:inline" />
              出欠・振替・月謝・AIレポートをひとつのアプリで。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-800 px-8 text-base font-bold text-white hover:bg-brand-900 transition-colors"
              >
                無料で始める
              </Link>
              <a
                href="#contact"
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-brand-800 px-8 text-base font-bold text-brand-800 hover:bg-brand-50 transition-colors"
              >
                まずは相談する
              </a>
            </div>
          </div>
          {/* Phone mockup */}
          <div className="flex-shrink-0">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ━━━ Features ━━━ */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-extrabold text-ink sm:text-3xl">主な機能</h2>
          <p className="mt-3 text-center text-base text-ink-light">
            教室運営に必要なものをすべてカバー
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {(
              [
                {
                  icon: CalendarCheck,
                  title: "出欠管理",
                  desc: "レッスンの出欠をかんたんに記録。欠席時の自動通知や振替管理もスムーズに。",
                },
                {
                  icon: RefreshCcw,
                  title: "振替管理",
                  desc: "振替申請から承認・スケジュール調整まで一元管理。先生も保護者もかんたん操作。",
                },
                {
                  icon: CreditCard,
                  title: "月謝管理",
                  desc: "月謝の請求・入金確認・未納リストの管理をデジタル化。手作業から解放されます。",
                },
                {
                  icon: Sparkles,
                  title: "AIレッスンレポート",
                  desc: "レッスン後のレポート作成をAIがサポート。保護者への共有もワンタップで完了。",
                },
              ] as { icon: LucideIcon; title: string; desc: string }[]
            ).map((item) => (
              <Card key={item.title} className="border-none bg-white shadow-sm">
                <CardContent className="pt-2">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-brand-100">
                    <item.icon className="size-6 text-brand-800" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-light">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ How it Works ━━━ */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">かんたん3ステップ</h2>
          <div className="mt-10 space-y-8 sm:space-y-10">
            {[
              {
                step: 1,
                title: "教室を登録する",
                desc: "教室名とメールアドレスを入力して無料アカウント作成。すぐに使い始められます。",
              },
              {
                step: 2,
                title: "生徒・コースを設定する",
                desc: "生徒情報とコースを登録。スケジュールを設定するだけで準備完了。",
              },
              {
                step: 3,
                title: "毎日の運営がかんたんに",
                desc: "出欠確認、月謝管理、レポート送信をアプリひとつでこなせます。",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col items-center gap-4 sm:flex-row sm:text-left"
              >
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-800 text-2xl font-extrabold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-1 text-base leading-relaxed text-ink-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-extrabold text-ink sm:text-3xl">よくある質問</h2>
          <div className="mt-10 space-y-3">
            <FaqItem
              q="料金はかかりますか？"
              a="現在は無料でお使いいただけます。将来的に有料プランを追加する場合も、基本機能は無料のまま提供する予定です。"
            />
            <FaqItem
              q="どんな教室に向いていますか？"
              a="ピアノ・バイオリンなどの音楽教室、書道・そろばん・英会話など、個人で運営している教室全般にご利用いただけます。"
            />
            <FaqItem
              q="保護者も使えますか？"
              a="はい、保護者向けのアプリも用意しています。レッスンのスケジュール確認や欠席連絡、レポートの受け取りができます。"
            />
            <FaqItem
              q="AIレポートとはなんですか？"
              a="レッスンのメモを入力するとAIが自動でレポート文章を作成します。保護者への連絡がぐっとかんたんになります。"
            />
            <FaqItem
              q="スマホがないと使えませんか？"
              a="スマホからでもパソコンからでもご利用いただけます。管理業務はパソコンの方が快適な場合もあります。"
            />
          </div>
        </div>
      </section>

      {/* ━━━ CTA Repeat ━━━ */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
            まずは無料で試してみませんか？
          </h2>
          <p className="mt-4 text-lg text-ink-light">
            登録は1分で完了。クレジットカードも不要です。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/login"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-800 px-8 text-base font-bold text-white hover:bg-brand-900 transition-colors"
            >
              無料で始める
            </Link>
            <a
              href="#contact"
              className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-brand-800 px-8 text-base font-bold text-brand-800 hover:bg-brand-50 transition-colors"
            >
              まずは相談する
            </a>
          </div>
        </div>
      </section>

      {/* ━━━ Contact Form ━━━ */}
      <section id="contact" className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-2xl font-extrabold text-ink sm:text-3xl">お問い合わせ</h2>
          <p className="mt-3 text-center text-base text-ink-light">
            ご質問・ご相談など、お気軽にお問い合わせください。
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ━━━ Footer ━━━ */}
      <footer className="border-t border-gray-200 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-logo text-lg font-bold text-brand-800">まなぶん</span>
          </div>
          <p className="text-sm text-ink-light">個人教室の運営をもっとかんたんに</p>
          <p className="text-xs text-ink-muted">&copy; 2026 まなぶん</p>
        </div>
      </footer>
    </div>
  );
}
