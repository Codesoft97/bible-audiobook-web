import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { APP_ROUTES } from "@/lib/constants";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Cadastro"
      title="Crie a conta principal da familia."
      description="Apos o cadastro, o login acontece automaticamente e a entrada segue para a selecao de perfis."
      footer={
        <AuthFooterLink href={APP_ROUTES.login} label="Ja possui conta?" action="Fazer login" />
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}

