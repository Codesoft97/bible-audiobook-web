import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordFlow } from "@/components/auth/forgot-password-flow";
import { APP_ROUTES } from "@/lib/constants";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recuperação"
      title="Recupere sua senha"
      description="Enviar email, validar código e redefinir a senha"
      footer={
        <AuthFooterLink href={APP_ROUTES.login} label="Lembrou sua senha?" action="Voltar ao login" />
      }
    >
      <ForgotPasswordFlow />
    </AuthShell>
  );
}
