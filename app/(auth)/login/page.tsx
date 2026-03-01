import Link from "next/link";

import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { APP_ROUTES } from "@/lib/constants";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Login"
      title="Entre para continuar a jornada da sua familia."
      description="Use email e senha ou Google e escolha seu perfil após entrar."
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <AuthFooterLink
            href={APP_ROUTES.register}
            label="Ainda nao tem conta?"
            action="Criar conta"
          />
          <Link href={APP_ROUTES.forgotPassword} className="font-medium text-primary">
            Recuperar acesso
          </Link>
        </div>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}

