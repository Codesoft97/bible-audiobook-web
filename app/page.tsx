import Image from "next/image";
import Link from "next/link";

import {
  BookOpenText,
  CheckCircle2,
  Headphones,
  MessageCircleHeart,
  HandsPraying,
  PlayCircle,
} from "@/components/icons";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { APP_ROUTES, WHATSAPP_FEATURE_ENABLED } from "@/lib/constants";

const FEATURES = [
  {
    eyebrow: "Explore o app",
    title: "Biblioteca completa",
    description:
      "Navegue por livros, capitulos e jornadas em áudio, continue de onde parou e siga aprendendo.",
    icon: BookOpenText,
    imageSrc: "/landing_home.png",
    imageAlt: "Tela principal da plataforma Evangelho em áudio",
    highlights: ["Livros e capitulos organizados", "Retome do ponto em que parou"],
    glowClassName: "bg-[radial-gradient(circle,rgba(229,187,102,0.24),transparent_68%)]",
    imageClassName: "object-[center_50%]",
  },
  {
    eyebrow: "Histórias reflexivas",
    title: "Parábolas",
    description:
      "Escute parábolas da Bíblia e aprenda com as histórias contadas por Jesus.",
    icon: PlayCircle,
    imageSrc: "/landing_parabolas.png",
    imageAlt: "Notebook exibindo a secao de parabolas",
    highlights: ["Parábolas de Jesus em áudio", "Referências para estudo enquanto ouve"],
    glowClassName: "bg-[radial-gradient(circle,rgba(77,131,212,0.24),transparent_68%)]",
    imageClassName: "object-[center_35%]",
  },
  {
    eyebrow: "Vida e fé",
    title: "Ensinamentos",
    description:
      "Ouça os ensinamentos de Deus sobre fé, perdão, família e muito mais.",
    icon: HandsPraying,
    imageSrc: "/landing_ensinamentos.png",
    imageAlt: "Pessoa ouvindo ensinamentos biblicos no celular",
    highlights: ["Temas para o dia a dia", "Palavra de conforto em momentos difíceis"],
    glowClassName: "bg-[radial-gradient(circle,rgba(229,187,102,0.2),transparent_70%)]",
    imageClassName: "!object-contain object-center scale-[0.92] md:scale-[0.98]",
  },
  {
    eyebrow: "Entrega automática",
    title: "WhatsApp",
    description:
      "Ative o envio no WhatsApp para receber diariamente a palavra de Deus.",
    icon: MessageCircleHeart,
    imageSrc: "/landing_whatsapp.png",
    imageAlt: "Mockup do envio de conteudo pelo WhatsApp",
    highlights: ["Comece o dia com uma promessa", "Mais constância na rotina espiritual"],
    glowClassName: "bg-[radial-gradient(circle,rgba(48,189,124,0.18),transparent_70%)]",
    imageClassName: "object-[center_2%]",
  },
] as const;

const STORE_LINKS = [
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

const SOCIAL_LINKS = [
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

const LANDING_FEATURES = FEATURES.filter(
  (feature) => WHATSAPP_FEATURE_ENABLED || feature.title !== "WhatsApp",
);

const LANDING_MONTHLY_PLAN_FEATURES = MONTHLY_PLAN_FEATURES.filter(
  (feature) => WHATSAPP_FEATURE_ENABLED || !feature.includes("WhatsApp"),
);

const LANDING_HERO_DESCRIPTION = WHATSAPP_FEATURE_ENABLED
  ? "Biblia em Ã¡udio, jornadas, promessas, parÃ¡bolas e envio no WhatsApp em uma experiÃªncia unica para toda a famÃ­lia."
  : "Biblia em Ã¡udio, jornadas, promessas e parÃ¡bolas em uma experiÃªncia unica para toda a famÃ­lia.";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden auth-atmosphere">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-28 md:px-6 md:pt-32">
        <header className="fixed inset-x-0 top-0 z-40 border-b border-border/65 bg-card/85 backdrop-blur-md">
          <div className="mx-auto w-full max-w-6xl px-4 py-3 md:px-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[auto_1fr_auto]">
              <Logo className="h-10 w-[148px] sm:h-14 sm:w-[260px]" compact={false} priority />

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

              <div className="flex flex-nowrap items-center justify-end gap-1.5 sm:gap-2">
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

            <nav className="mt-3 grid grid-cols-3 gap-2 lg:hidden">
              <a
                href="#funcionalidades"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border/60 bg-background/65 px-3 text-[11px] font-medium text-foreground sm:text-xs"
              >
                Funcionalidades
              </a>
              <a
                href="#planos"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border/60 bg-background/65 px-3 text-[11px] font-medium text-foreground sm:text-xs"
              >
                Planos
              </a>
              <a
                href="#baixar-app"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border/60 bg-background/65 px-3 text-[11px] font-medium text-foreground sm:text-xs"
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
              {LANDING_HERO_DESCRIPTION}
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
                <p className="mt-1 text-sm text-muted-foreground">Livros, Jornadas, Parábolas e muito mais</p>
              </div>
              <div className="rounded-2xl border border-border/65 bg-background/55 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Família</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">Até 2 Perfis</p>
                <p className="mt-1 text-sm text-muted-foreground">Progresso e histórico individual</p>
              </div>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="relative left-1/2 mt-14 w-screen -translate-x-1/2 scroll-mt-28">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Funcionalidades
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground md:text-4xl">
                Uma jornada espiritual para ouvir, aprender e compartilhar.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                Viva o Evangelho em áudio, em casa, na escola, no trabalho, no trânsito ou onde quiser.
              </p>
            </div>
          </div>

          <div className="mt-8 border-y border-black/10 dark:border-border/60">
            {LANDING_FEATURES.map((feature, index) => (
              <article
                key={feature.title}
                className="relative overflow-hidden border-b border-black/10 bg-[linear-gradient(135deg,rgba(255,250,242,0.98),rgba(244,248,255,0.96)_46%,rgba(252,243,227,0.98))] last:border-b-0 dark:border-border/60 dark:bg-[linear-gradient(135deg,rgba(8,18,33,0.98),rgba(12,28,49,0.95)_44%,rgba(8,16,28,0.98))]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(232,191,104,0.16),transparent_24%),radial-gradient(circle_at_82%_50%,rgba(67,111,183,0.14),transparent_30%)] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(232,191,104,0.08),transparent_24%),radial-gradient(circle_at_82%_50%,rgba(67,111,183,0.16),transparent_30%)]" />
                <div className={`absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 blur-3xl ${feature.glowClassName}`} />

                <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:items-center lg:gap-8 lg:py-14">
                  <div className="max-w-xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-highlight/40 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-highlight shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-highlight/25 dark:bg-highlight/10 dark:shadow-none">
                      <feature.icon className="size-3.5" />
                      {feature.eyebrow}
                    </span>

                    <h3 className="mt-5 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
                      {feature.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {feature.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-sm text-foreground/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-border/65 dark:bg-background/35 dark:shadow-none"
                        >
                          <span className="size-2 rounded-full bg-highlight" />
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-black/10 bg-white/68 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.07)] backdrop-blur-sm dark:border-border/60 dark:bg-background/25 dark:shadow-none">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          Experiência
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          Interface simples e intuitiva
                        </p>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white/68 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.07)] backdrop-blur-sm dark:border-border/60 dark:bg-background/25 dark:shadow-none">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          Rotina
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          Conteúdo pronto para acompanhar seu dia
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex min-h-[360px] items-center justify-center md:min-h-[460px] lg:min-h-[560px]">
                    <div className="relative h-full min-h-[340px] w-full md:min-h-[430px] lg:min-h-[520px]">
                      <Image
                        src={feature.imageSrc}
                        alt={feature.imageAlt}
                        fill
                        priority={index === 0}
                        quality={100}
                        sizes="(min-width: 1280px) 760px, (min-width: 1024px) 62vw, 100vw"
                        className={`object-cover drop-shadow-[0_28px_55px_rgba(0,0,0,0.38)] ${feature.imageClassName}`}
                      />
                    </div>
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
                Ao realizar seu cadastro você já começa no período gratuito para testar a plataforma sem compromisso.
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
                {LANDING_MONTHLY_PLAN_FEATURES.map((feature) => (
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
              <Link
                href={APP_ROUTES.register}
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl border border-highlight/45 bg-highlight px-4 text-sm font-semibold text-background shadow-[0_14px_30px_rgba(229,187,102,0.22)] transition hover:bg-highlight/90"
              >
                Assinar plano mensal
              </Link>
            </article>

            <article className="rounded-2xl border border-highlight/35 bg-gradient-to-br from-highlight/12 to-background p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Anual</p>
              <p className="mt-3 text-4xl font-semibold text-foreground">R$ 119,99</p>
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
              <Link
                href={APP_ROUTES.register}
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Assinar plano anual
              </Link>
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
                        {store.badge ? (
                          <span className="mt-1 inline-flex rounded-full border border-highlight/35 bg-highlight/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-highlight">
                            {store.badge}
                          </span>
                        ) : null}
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
              {SOCIAL_LINKS.map((social) => (
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
              <a
                href="mailto:evangelhoemaudio@gmail.com"
                className="transition hover:text-foreground"
              >
                contato@evangelhoemaudio
              </a>
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
