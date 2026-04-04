import Link from "next/link";

import { Logo } from "@/components/logo";
import { APP_ROUTES, CONTACT_EMAIL } from "@/lib/constants";

export const SITE_STORE_LINKS = [
  {
    label: "Google Play",
    href: "https://play.google.com/store",
    hint: "Android",
    available: false,
    badge: "Em breve",
  },
  {
    label: "App Store",
    href: "https://www.apple.com/app-store/",
    hint: "iOS",
    available: false,
    badge: "Em breve",
  },
] as const;

export const SITE_SOCIAL_LINKS = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@Evangelhoemaudio-01",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/evangelhoemaudio",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61584976944772&locale=pt_BR",
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/70">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-5 md:px-6">
        <div>
          <Logo className="h-14 w-[220px]" compact={false} />
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Plataforma para ouvir a Palavra de Deus em qualquer lugar.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Acesso rapido</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href={APP_ROUTES.login} className="transition hover:text-foreground">
              Login
            </Link>
            <Link href={APP_ROUTES.register} className="transition hover:text-foreground">
              Cadastro
            </Link>
            <Link href={APP_ROUTES.forgotPassword} className="transition hover:text-foreground">
              Recuperar senha
            </Link>
            <Link href={APP_ROUTES.privacyPolicy} className="transition hover:text-foreground">
              Política de privacidade
            </Link>
            <Link href={APP_ROUTES.termsOfUse} className="transition hover:text-foreground">
              Termos de uso
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Aplicativos</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            {SITE_STORE_LINKS.map((store) =>
              store.available ? (
                <a
                  key={store.label}
                  href={store.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-foreground"
                >
                  {store.label} ({store.hint})
                </a>
              ) : (
                <span key={store.label} className="flex flex-col items-start gap-1 text-muted-foreground/85">
                  <span>
                    {store.label} ({store.hint})
                  </span>
                  <span className="rounded-full border border-highlight/35 bg-highlight/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-highlight">
                    {store.badge}
                  </span>
                </span>
              ),
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Redes sociais</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            {SITE_SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-foreground"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Contato</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition hover:text-foreground">
              contato@evangelhoemaudio
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground md:px-6">
        © {new Date().getFullYear()} Evangelho em Áudio. Todos os direitos reservados.
      </div>
    </footer>
  );
}
