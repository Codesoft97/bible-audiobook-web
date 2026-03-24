import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";

import {
  BookOpenText,
  Headphones,
  ShareNetwork,
} from "@/components/icons";
import { Logo } from "@/components/logo";
import { APP_ROUTES } from "@/lib/constants";
import { fetchBackend } from "@/lib/backend-api";
import { parseBackendEnvelope } from "@/lib/server-response";
import {
  formatBibleVerseShareText,
  resolveBibleVerseShareImageUrl,
  type BibleVerseShareData,
} from "@/lib/verse-share";

interface VerseSharePageParams {
  abbrev: string;
  chapter: string;
  verse: string;
}

interface VerseSharePageResult {
  data: BibleVerseShareData | null;
  message: string;
  status: number;
}

function parsePositiveInteger(value: string) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return null;
  }

  return parsedValue;
}

const getVerseShareData = cache(
  async (
    abbrev: string,
    chapter: string,
    verse: string,
  ): Promise<VerseSharePageResult> => {
    const parsedChapter = parsePositiveInteger(chapter);
    const parsedVerse = parsePositiveInteger(verse);

    if (!abbrev || !parsedChapter || !parsedVerse) {
      return {
        data: null,
        message: "Referencia biblica invalida.",
        status: 400,
      };
    }

    const searchParams = new URLSearchParams({
      abbrev: abbrev.trim().toLowerCase(),
      chapter: String(parsedChapter),
      verse: String(parsedVerse),
    });
    const backendResponse = await fetchBackend(`/share/verse?${searchParams.toString()}`, {
      method: "GET",
    });
    const envelope = await parseBackendEnvelope<BibleVerseShareData>(backendResponse);

    if (!backendResponse.ok || envelope.status !== "success" || !envelope.data) {
      return {
        data: null,
        message: envelope.message ?? "Nao foi possivel carregar este versiculo.",
        status: backendResponse.status || 400,
      };
    }

    return {
      data: envelope.data,
      message: "",
      status: backendResponse.status || 200,
    };
  },
);

function buildMetadataTitle(data: BibleVerseShareData | null) {
  return data
    ? `${data.reference} | Evangelho em Audio`
    : "Versiculo compartilhado | Evangelho em Audio";
}

function buildMetadataDescription(data: BibleVerseShareData | null, message: string) {
  if (data) {
    return formatBibleVerseShareText(data);
  }

  return message || "Compartilhe versiculos da Biblia em texto com o Evangelho em Audio.";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<VerseSharePageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getVerseShareData(
    resolvedParams.abbrev,
    resolvedParams.chapter,
    resolvedParams.verse,
  );
  const title = buildMetadataTitle(result.data);
  const description = buildMetadataDescription(result.data, result.message);

  if (!result.data) {
    return {
      title,
      description,
    };
  }

  const imageUrl = resolveBibleVerseShareImageUrl(result.data);

  return {
    title,
    description,
    alternates: {
      canonical: result.data.shareUrl,
    },
    openGraph: {
      title,
      description,
      url: result.data.shareUrl,
      type: "article",
      locale: "pt_BR",
      images: [
        {
          url: imageUrl,
          alt: result.data.reference,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function VerseSharePage({
  params,
}: {
  params: Promise<VerseSharePageParams>;
}) {
  const resolvedParams = await params;
  const result = await getVerseShareData(
    resolvedParams.abbrev,
    resolvedParams.chapter,
    resolvedParams.verse,
  );

  return (
    <main className="auth-atmosphere min-h-screen px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col justify-center">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={APP_ROUTES.root} className="inline-flex">
            <Logo className="h-12 w-[220px]" compact={false} priority />
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link
              href={APP_ROUTES.root}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/65 bg-background/70 px-5 text-sm font-medium text-foreground transition hover:bg-background"
            >
              Conhecer a plataforma
            </Link>
            <Link
              href={APP_ROUTES.login}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Entrar
            </Link>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-[32px] border border-border/70 bg-card/88 shadow-glow">
          <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative overflow-hidden border-b border-border/60 bg-[linear-gradient(160deg,rgba(229,187,102,0.22),rgba(255,250,242,0.85)_44%,rgba(214,226,245,0.55))] p-6 dark:bg-[linear-gradient(160deg,rgba(229,187,102,0.14),rgba(12,28,49,0.96)_44%,rgba(8,16,28,0.98))] lg:border-b-0 lg:border-r">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(232,191,104,0.2),transparent_22%),radial-gradient(circle_at_84%_14%,rgba(48,91,167,0.16),transparent_26%),radial-gradient(circle_at_52%_100%,rgba(232,191,104,0.14),transparent_34%)]" />

              <div className="relative">
                <p className="inline-flex items-center gap-2 rounded-full border border-highlight/35 bg-highlight/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-highlight">
                  <ShareNetwork className="size-3.5" />
                  Compartilhamento de versiculo
                </p>

                <div className="mt-6 rounded-[28px] border border-border/55 bg-background/70 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-highlight/12 text-highlight">
                      <BookOpenText className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        Evangelho em Audio
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        Biblia em texto para compartilhar
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-muted-foreground">
                    Receba um versiculo pronto para enviar no WhatsApp, nas redes sociais
                    ou guardar em sua rotina de leitura.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/65 bg-background/75 px-3 py-1.5 text-xs font-medium text-foreground">
                      <Headphones className="size-3.5 text-highlight" />
                      Plataforma com audio e texto
                    </span>
                    <span className="inline-flex rounded-full border border-border/65 bg-background/75 px-3 py-1.5 text-xs font-medium text-foreground">
                      @evangelhoemaudio
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 lg:p-10">
              {result.data ? (
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {result.data.book} / {result.data.translation.toUpperCase()}
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground md:text-5xl">
                      {result.data.reference}
                    </h1>

                    <blockquote className="mt-8 rounded-[28px] border border-border/65 bg-background/60 p-6 md:p-7">
                      <p className="text-xl leading-9 text-foreground md:text-2xl md:leading-10">
                        "{result.data.text}"
                      </p>
                      <footer className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-highlight">
                        {result.data.reference}
                      </footer>
                    </blockquote>

                    <p className="mt-5 text-sm leading-7 text-muted-foreground">
                      {formatBibleVerseShareText(result.data)}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={result.data.shareUrl}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      Abrir link compartilhavel
                    </a>
                    <a
                      href={resolveBibleVerseShareImageUrl(result.data)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/65 bg-background/70 px-5 text-sm font-medium text-foreground transition hover:bg-background"
                    >
                      Abrir imagem do versiculo
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-center">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Compartilhamento indisponivel
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">
                    Nao foi possivel abrir este versiculo
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                    {result.message}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={APP_ROUTES.root}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      Ir para o inicio
                    </Link>
                    <Link
                      href={APP_ROUTES.login}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/65 bg-background/70 px-5 text-sm font-medium text-foreground transition hover:bg-background"
                    >
                      Entrar na plataforma
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
