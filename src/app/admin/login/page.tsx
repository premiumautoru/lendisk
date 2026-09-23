import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LogoMark } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Вход" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <LogoMark className="size-16" />
          <p className="mt-6 font-display text-lg font-semibold uppercase tracking-[0.3em]">Lendisk</p>
          <p className="mt-2 text-sm text-bone/50">Панель управления сайтом</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
