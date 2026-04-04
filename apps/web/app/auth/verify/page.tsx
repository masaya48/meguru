import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  // If there's a token but no error, redirect to the Route Handler to process it
  if (token && !error) {
    redirect(`/api/auth/verify?token=${token}`);
  }

  // Show error page
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-4">
        <p className="text-xl font-bold text-ink">リンクが無効または期限切れです</p>
        <p className="text-ink-light">もう一度ログインしてください</p>
        <a
          href="/auth/login"
          className="inline-block rounded-xl bg-brand-800 px-6 py-3 text-white font-bold"
        >
          ログインページへ
        </a>
      </div>
    </div>
  );
}
