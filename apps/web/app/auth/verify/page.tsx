import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { setToken, parseJwt } from "@/lib/auth";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/auth/login");
  }

  try {
    const res = await api<{ accessToken: string }>(`/auth/verify?token=${token}`, {
      method: "POST",
    });

    await setToken(res.accessToken);
    const payload = parseJwt(res.accessToken);
    if (payload?.role === "ADMIN") {
      redirect("/dashboard");
    } else {
      redirect("/");
    }
  } catch {
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
}
