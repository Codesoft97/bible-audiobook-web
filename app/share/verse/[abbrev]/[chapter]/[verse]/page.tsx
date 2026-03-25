import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";

import { APP_ROUTES } from "@/lib/constants";
import { fetchBackend } from "@/lib/backend-api";
import { parseBackendEnvelope } from "@/lib/server-response";
import {
  buildBibleVerseShareImageApiPath,
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
  const displayImagePath = result.data ? buildBibleVerseShareImageApiPath(result.data) : "";

  if (!result.data) {
    return (
      <main className="auth-atmosphere min-h-screen px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-3xl items-center justify-center">
          <div className="rounded-[28px] border border-border/70 bg-card/88 p-8 text-center shadow-glow">
            <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
              Nao foi possivel abrir este versiculo
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
              {result.message}
            </p>
            <div className="mt-8">
              <Link
                href={APP_ROUTES.root}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Conhecer a plataforma
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07101b]">
      <Image
        src={displayImagePath}
        alt={result.data.reference}
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,15,0.26),rgba(3,8,15,0.44)_56%,rgba(3,8,15,0.72))]" />

      <div className="relative flex min-h-screen items-end justify-center px-4 pb-8 pt-8 md:pb-12">
        <h1 className="sr-only">{result.data.reference}</h1>
        <Link
          href={APP_ROUTES.root}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[0_18px_40px_rgba(7,16,27,0.42)] transition hover:bg-primary/90"
        >
          Conhecer a plataforma
        </Link>
      </div>
    </main>
  );
}
