import type { PropsWithChildren } from "react";

import { redirect } from "next/navigation";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getServerSession } from "@/lib/auth/session.server";
import { APP_ROUTES } from "@/lib/constants";

export default async function AuthLayout({ children }: PropsWithChildren) {
  const session = await getServerSession();

  if (session?.selectedProfile) {
    redirect(APP_ROUTES.app);
  }

  if (session) {
    redirect(APP_ROUTES.profiles);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8">
      <div className="auth-atmosphere absolute inset-0" />
      <div className="relative mx-auto flex w-full max-w-6xl items-start justify-between pb-6">
        <Logo className="max-w-[300px]" />
        <ThemeToggle />
      </div>
      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center justify-center">
        <section className="flex w-full max-w-xl items-center justify-center">{children}</section>
      </div>
    </main>
  );
}
