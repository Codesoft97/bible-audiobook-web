import Link from "next/link";

import {
  BookOpenText,
  CheckCircle2,
  Headphones,
  Image as ImageIcon,
  MessageCircleHeart,
  HandsPraying,
  PersonSimpleHike,
  PlayCircle,
  Video,
} from "@/components/icons";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { APP_ROUTES } from "@/lib/constants";

const FEATURES = [
  {
    title: "Biblioteca em áudio",
    description:
      "Explore livros da Bíblia em áudio com organização por capítulos para ouvir todos os dias.",
    icon: BookOpenText,
    imageLabel: "Imagem da biblioteca",
    videoLabel: "Video da navegacao",
  },
  {
    title: "Jornadas de personagens",
    description:
      "Tenha trilhas especiais com narrações guiadas por personagens biblicos e temas da fé.",
    icon: PersonSimpleHike,
    imageLabel: "Imagem das jornadas",
    videoLabel: "Video das jornadas",
  },
  {
    title: "Promessas para o dia",
    description:
      "Receba promessas biblicas em áudio para fortalecer sua rotina e tempo de devocional.",
    icon: HandsPraying,
    imageLabel: "Imagem das promessas",
    videoLabel: "Video das promessas",
  },
  {
    title: "Envio no WhatsApp",
    description:
      "Ative entregas de capitulos ou promessas direto no WhatsApp todos os dias.",
    icon: MessageCircleHeart,
    imageLabel: "Imagem do WhatsApp",
    videoLabel: "Video do WhatsApp",
  },
] as const;

const STORE_LINKS = [
  {
    label: "Google Play",
    href: "https://play.google.com/store",
    hint: "Android",
    available: true,
  },
  {
    label: "App Store",
    href: "https://www.apple.com/app-store/",
    hint: "iOS",
    available: false,
    badge: "Em breve",
  },
] as const;

const MONTHLY_PLAN_FEATURES = [
  "Biblioteca dos livros da Bíblia em áudio",
  "Jornadas de personagens bíblicos em áudio",
  "Caixinha de promessas em áudio",
  "Ensinamentos bíblicos sobre assuntos da vida em áudio",
  "Parábolas da Bíblia em áudio",
  "Envios de promessas diárias via WhatsApp",
  "Envios de capitulos diários via WhatsApp",
] as const;

const YEARLY_PLAN_FEATURES = [
  "Todos os benefícios do plano mensal",
  "Melhor custo para uso continuo",
  "Renovação anual simples",
] as const;

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden auth-atmosphere">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-28 md:px-6 md:pt-32">
        <header className="fixed inset-x-0 top-0 z-40 border-b border-border/65 bg-card/85 backdrop-blur-md">
          <div className="mx-auto w-full max-w-6xl px-4 py-3 md:px-6">
            <div className="grid items-center gap-3 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto]">
              <Logo className="h-11 w-[180px] sm:h-14 sm:w-[260px]" compact={false} priority />

              <nav className="hidden items-center justify-center gap-2 lg:flex">
                <a
                  href="#funcionalidades"
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-background/75 hover:text-foreground"
                >
                  Funcionalidades
                </a>
                <a
                  href="#planos"
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-background/75 hover:text-foreground"
                >
                  Planos
                </a>
                <a
                  href="#baixar-app"
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-background/75 hover:text-foreground"
                >
                  Baixar app
                </a>
              </nav>

              <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                <Link
                  href={APP_ROUTES.login}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-border/70 bg-background/70 px-3 text-xs font-medium text-foreground transition hover:bg-background sm:h-10 sm:px-4 sm:text-sm"
                >
                  Login
                </Link>
                <Link
                  href={APP_ROUTES.register}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 sm:h-10 sm:px-4 sm:text-sm"
                >
                  Cadastro
                </Link>
                <ThemeToggle />
              </div>
            </div>

            <nav className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
              <a
                href="#funcionalidades"
                className="shrink-0 rounded-full border border-border/60 bg-background/65 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                Funcionalidades
              </a>
              <a
                href="#planos"
                className="shrink-0 rounded-full border border-border/60 bg-background/65 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                Planos
              </a>
              <a
                href="#baixar-app"
                className="shrink-0 rounded-full border border-border/60 bg-background/65 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                Baixar app
              </a>
            </nav>
          </div>
        </header>

        <section className="mt-10 scroll-mt-28 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-highlight">
              <PlayCircle className="size-3.5" />
              Evangelho em áudio
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground md:text-6xl">
              Ouça, aprenda e viva a Palavra de Deus todos os dias.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Biblia em áudio, jornadas, promessas, parábolas e envio no WhatsApp em uma experiência unica
              para toda a família.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={APP_ROUTES.register}
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Criar conta grátis
              </Link>
              <Link
                href={APP_ROUTES.login}
                className="inline-flex h-12 items-center justify-center rounded-full border border-border/70 bg-card/65 px-6 text-sm font-semibold text-foreground transition hover:bg-card"
              >
                Ja tenho conta
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/82 p-5 shadow-glow">
            <div className="flex items-center gap-3 rounded-2xl border border-border/65 bg-background/55 p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-highlight/14 text-highlight">
                <Headphones className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experiencia de escuta</p>
                <p className="text-lg font-semibold">Player continuo e histórico por perfil</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/65 bg-background/55 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Conteúdo</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">Em áudio</p>
                <p className="mt-1 text-sm text-muted-foreground">Livros, Jornadas, Promessas e parábolas</p>
              </div>
              <div className="rounded-2xl border border-border/65 bg-background/55 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Família</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">Até 2 Perfis</p>
                <p className="mt-1 text-sm text-muted-foreground">Progresso e histórico individual</p>
              </div>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="mt-12 scroll-mt-28">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Funcionalidades
              </p>
              <h2 className="mt-1 text-3xl font-semibold text-foreground md:text-4xl">
                Ouça os ensinamentos de Deus em qualquer lugar
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-border/65 bg-card/78 p-5 transition hover:border-highlight/35 hover:bg-card"
              >
                <p className="inline-flex size-10 items-center justify-center rounded-xl bg-highlight/12 text-highlight">
                  <feature.icon className="size-5" />
                </p>
                <h3 className="mt-3 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="group aspect-video rounded-xl border border-dashed border-border/70 bg-background/60 p-3 transition hover:border-highlight/40 hover:bg-background/80">
                    <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      <ImageIcon className="size-3.5 text-highlight" />
                      Imagem
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">{feature.imageLabel}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Espaco reservado para screenshot da funcionalidade.
                    </p>
                  </div>

                  <div className="group aspect-video rounded-xl border border-dashed border-border/70 bg-background/60 p-3 transition hover:border-highlight/40 hover:bg-background/80">
                    <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      <Video className="size-3.5 text-highlight" />
                      Video
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">{feature.videoLabel}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Espaco reservado para demo em video.
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="planos"
          className="mt-12 scroll-mt-28 rounded-3xl border border-border/70 bg-card/88 p-6 shadow-glow md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Planos</p>
              <h2 className="mt-1 text-3xl font-semibold text-foreground md:text-4xl">
                Escolha o melhor plano para sua família
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Ao realizar seu cadastro você já começa no período gratuito para testar a plataforma sem compromisso e sem assinatura.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2">
              <span className="inline-flex items-center rounded-full border border-success/35 bg-success/10 px-4 py-2 text-sm font-semibold text-success">
                7 dias grátis para testar
              </span>
              <p className="text-sm font-medium text-muted-foreground">Cancele a qualquer momento.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-border/65 bg-background/65 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Mensal</p>
              <p className="mt-3 text-4xl font-semibold text-foreground">R$ 12,90</p>
              <p className="mt-1 text-sm text-muted-foreground">por mês</p>
              <ul className="mt-4 grid gap-2 text-sm">
                {MONTHLY_PLAN_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/50 px-3 py-2.5 text-foreground/90"
                  >
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                      <CheckCircle2 className="size-3.5" />
                    </span>
                    <span className="leading-5">{feature}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-highlight/35 bg-gradient-to-br from-highlight/12 to-background p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Anual</p>
              <p className="mt-3 text-4xl font-semibold text-foreground">R$ 118,80</p>
              <p className="mt-1 text-sm text-muted-foreground">por ano</p>
              <p className="mt-3 inline-flex rounded-full border border-highlight/40 bg-highlight/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-highlight">
                Economia em relação ao mensal
              </p>
              <ul className="mt-4 grid gap-2 text-sm">
                {YEARLY_PLAN_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 rounded-xl border border-highlight/30 bg-highlight/10 px-3 py-2.5 text-foreground/90"
                  >
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-highlight/20 text-highlight">
                      <CheckCircle2 className="size-3.5" />
                    </span>
                    <span className="leading-5">{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section
          id="baixar-app"
          className="relative left-1/2 mt-12 w-screen -translate-x-1/2 scroll-mt-28 border-y border-border/70 bg-gradient-to-br from-card/90 to-accent/45"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Versão mobile
                </p>
                <h2 className="mt-1 text-3xl font-semibold text-foreground md:text-4xl">
                  Leve o Evangelho com você
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Baixe o app no seu celular e continue ouvindo quando estiver no transito, na
                  caminhada ou no seu tempo de devocional.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {STORE_LINKS.map((store) =>
                  store.available ? (
                    <a
                      key={store.label}
                      href={store.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-w-[170px] items-center justify-between rounded-2xl border border-border/65 bg-background/70 px-4 py-3 text-left transition hover:border-highlight/40 hover:bg-background"
                    >
                      <span>
                        <span className="block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          {store.hint}
                        </span>
                        <span className="block text-sm font-semibold text-foreground">{store.label}</span>
                      </span>
                      <PlayCircle className="size-4 text-highlight" />
                    </a>
                  ) : (
                    <div
                      key={store.label}
                      aria-disabled="true"
                      className="inline-flex min-w-[170px] items-center justify-between rounded-2xl border border-border/60 bg-background/45 px-4 py-3 text-left opacity-80"
                    >
                      <span>
                        <span className="block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          {store.hint}
                        </span>
                        <span className="block text-sm font-semibold text-foreground">{store.label}</span>
                        <span className="mt-1 inline-flex rounded-full border border-highlight/35 bg-highlight/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-highlight">
                          {store.badge}
                        </span>
                      </span>
                      <PlayCircle className="size-4 text-muted-foreground/60" />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-border/70 bg-card/70">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
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
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Aplicativos</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              {STORE_LINKS.map((store) =>
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
                  <span key={store.label} className="inline-flex items-center gap-2 text-muted-foreground/85">
                    {store.label} ({store.hint})
                    <span className="rounded-full border border-highlight/35 bg-highlight/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-highlight">
                      {store.badge}
                    </span>
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground md:px-6">
          © {new Date().getFullYear()} Evangelho em áudio. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  );
}
