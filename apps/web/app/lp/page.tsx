import type { Metadata } from "next";
import Link from "next/link";
import {
  Send,
  Eye,
  MousePointerClick,
  MessageSquare,
  BarChart3,
  Bell,
  UserPlus,
  FileText,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "めぐる — 町内会・自治会向けデジタル回覧板",
  description: "紙の回覧板をデジタル化。お知らせ配信・既読管理・出欠確認をスマホひとつで。",
  openGraph: {
    title: "めぐる — 町内会・自治会向けデジタル回覧板",
    description: "紙の回覧板をデジタル化。お知らせ配信・既読管理・出欠確認をスマホひとつで。",
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
        <div className="bg-brand-800 px-4 py-3 text-sm font-bold text-white">○○町内会</div>
        {/* Content */}
        <div className="space-y-2.5 p-3">
          {/* Unread card */}
          <div className="rounded-lg border-l-4 border-coral-500 bg-coral-50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full bg-coral-500" />
              <span className="text-xs font-bold text-coral-600">未読</span>
            </div>
            <p className="text-sm font-medium text-ink">春の清掃活動のお知らせ</p>
            <p className="mt-0.5 text-xs text-ink-light">4月12日（土）9:00〜</p>
          </div>
          {/* Read card */}
          <div className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-brand-600" />
              <span className="text-xs font-bold text-brand-600">既読</span>
            </div>
            <p className="text-sm font-medium text-ink">集金のお知らせ</p>
            <p className="mt-0.5 text-xs text-ink-light">3月分 町内会費</p>
          </div>
          {/* Read card 2 */}
          <div className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-brand-600" />
              <span className="text-xs font-bold text-brand-600">既読</span>
            </div>
            <p className="text-sm font-medium text-ink">防災訓練の日程</p>
            <p className="mt-0.5 text-xs text-ink-light">5月18日（日）予定</p>
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
                めぐる
              </span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
              紙の回覧板、
              <br />
              もう卒業しませんか？
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-light sm:text-xl">
              めぐるは、町内会のお知らせ配信・既読管理・
              <br className="hidden sm:inline" />
              出欠確認をスマホひとつで実現するサービスです。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                className="h-12 rounded-xl bg-brand-800 px-8 text-base font-bold text-white hover:bg-brand-900"
                render={<Link href="/auth/register" />}
              >
                無料で始める
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-brand-800 px-8 text-base font-bold text-brand-800 hover:bg-brand-50"
                render={<a href="#contact" />}
              >
                まずは相談する
              </Button>
            </div>
          </div>
          {/* Phone mockup */}
          <div className="flex-shrink-0">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ━━━ Pain Points ━━━ */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
            こんなお悩みありませんか？
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                emoji: "🐌",
                title: "回覧板が回るのに\n1週間以上かかる",
              },
              {
                emoji: "❓",
                title: "誰が読んだか\n把握できない",
              },
              {
                emoji: "📝",
                title: "出欠確認の集計が\n手作業で大変",
              },
            ].map((item) => (
              <Card key={item.title} className="border-none bg-white shadow-sm">
                <CardContent className="pt-2 text-center">
                  <span className="text-4xl">{item.emoji}</span>
                  <p className="mt-3 whitespace-pre-line text-base font-bold leading-snug text-ink sm:text-lg">
                    {item.title}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Solution ━━━ */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
            めぐるなら、こう変わります
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Send,
                title: "一斉配信で即日届く",
                desc: "スマホに通知、LINEでも届く。もう回覧を待つ必要はありません。",
              },
              {
                icon: Eye,
                title: "既読率がひと目でわかる",
                desc: "誰が読んだかリアルタイムで確認。催促もワンタップ。",
              },
              {
                icon: MousePointerClick,
                title: "出欠もワンタップ",
                desc: "⭕❌の大きなボタンで回答完了。集計も自動です。",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-100">
                  <item.icon className="size-8 text-brand-800" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Features ━━━ */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-extrabold text-ink sm:text-3xl">主な機能</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "回覧配信",
                desc: "お知らせ・出欠確認・アンケートを簡単作成。テンプレートも用意しています。",
              },
              {
                icon: BarChart3,
                title: "既読・回答管理",
                desc: "既読率・回答率をダッシュボードで確認。誰が未読かもひと目でわかります。",
              },
              {
                icon: Bell,
                title: "LINE通知",
                desc: "新着回覧をLINEでお知らせ。出欠もLINEから回答できます。",
              },
            ].map((item) => (
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
                icon: MessageSquare,
                title: "自治会を登録する",
                desc: "町内会名を入力して無料アカウント作成。メールアドレスだけでOK。",
              },
              {
                step: 2,
                icon: UserPlus,
                title: "住民を招待する",
                desc: "QRコードやLINEで住民を招待。スマホが苦手な方も簡単に参加できます。",
              },
              {
                step: 3,
                icon: Send,
                title: "回覧を配信する",
                desc: "タイトルと本文を書いて配信ボタンを押すだけ。全世帯に届きます。",
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
              q="スマホが苦手な人でも使えますか？"
              a="大きな文字とシンプルな画面設計で、高齢者の方にも安心してお使いいただけます。操作に困ったときのサポートも充実しています。"
            />
            <FaqItem
              q="個人情報は大丈夫ですか？"
              a="データは暗号化して安全に管理しています。個人情報保護法に基づき、適切に取り扱います。"
            />
            <FaqItem
              q="パソコンでも使えますか？"
              a="はい、管理者向けのPC画面も用意しています。回覧の作成や集計はパソコンからも操作できます。"
            />
            <FaqItem
              q="LINEがないと使えませんか？"
              a="LINEなしでもWebブラウザから利用可能です。LINEをお持ちの方は、通知や回答がより便利になります。"
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
            <Button
              className="h-12 rounded-xl bg-brand-800 px-8 text-base font-bold text-white hover:bg-brand-900"
              render={<Link href="/auth/register" />}
            >
              無料で始める
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl border-brand-800 px-8 text-base font-bold text-brand-800 hover:bg-brand-50"
              render={<a href="#contact" />}
            >
              まずは相談する
            </Button>
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
            <span className="font-logo text-lg font-bold text-brand-800">めぐる</span>
          </div>
          <p className="text-sm text-ink-light">地域をつなぐ、情報がめぐる</p>
          <p className="text-xs text-ink-muted">&copy; 2026 めぐる</p>
        </div>
      </footer>
    </div>
  );
}
