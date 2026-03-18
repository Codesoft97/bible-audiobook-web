import { AuthFooterLink, AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { APP_ROUTES } from "@/lib/constants";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Cadastro"
      title="Crie a conta principal da sua família."
      description="Após o cadastro você vai poder adicionar outros perfis e compartilhar o acesso com quem você ama."
      footer={
        <AuthFooterLink href={APP_ROUTES.login} label="Ja possui conta?" action="Fazer login" />
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}

