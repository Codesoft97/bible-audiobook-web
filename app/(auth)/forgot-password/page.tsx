import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordFlow } from "@/components/auth/forgot-password-flow";
import { APP_ROUTES } from "@/lib/constants";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recuperacao"
      title="Recupere sua senha sem expor informacoes da conta."
      description="O fluxo segue a API do backend: enviar email, validar codigo e redefinir a senha com token temporario."
      footer={
        <AuthFooterLink href={APP_ROUTES.login} label="Lembrou sua senha?" action="Voltar ao login" />
      }
    >
      <ForgotPasswordFlow />
    </AuthShell>
  );
}
