"use client";

import { useMemo, useState } from "react";

import { LoaderCircle, Sparkles, Volume2 } from "lucide-react";

import { AudioPlayer } from "@/components/app/audio-player";
import type { AudioTrack } from "@/components/app/audio-player";
import { useAudio } from "@/components/providers/audio-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ApiEnvelope } from "@/lib/auth/types";
import type { BiblePromise, BiblePromiseStreamPayload } from "@/lib/bible-promises";
import { cn } from "@/lib/utils";

function buildPromiseLabel(promise: BiblePromise) {
  return `${promise.book} ${promise.chapter}:${promise.verse}`;
}

export function BiblePromisePanel() {
  const audio = useAudio();

  const [promise, setPromise] = useState<BiblePromise | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);

  const trackList = useMemo<AudioTrack[]>(() => {
    if (!promise || !audioUrl) {
      return [];
    }

    return [
      {
        id: promise.id,
        title: buildPromiseLabel(promise),
        subtitle: promise.category,
        src: audioUrl,
      },
    ];
  }, [audioUrl, promise]);

  const playerPromise = promise && trackList.length > 0 ? promise : null;

  async function handleReceivePromise() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setIsDrawing(true);

    try {
      const randomResponse = await fetch("/api/bible-promises/random", {
        cache: "no-store",
      });
      const randomPayload = (await randomResponse.json()) as ApiEnvelope<BiblePromise>;

      if (!randomResponse.ok || randomPayload.status !== "success" || !randomPayload.data) {
        setError(randomPayload.message ?? "Nao foi possivel receber uma nova promessa.");
        return;
      }

      const selectedPromise = randomPayload.data;
      setPromise(selectedPromise);

      const streamResponse = await fetch(
        `/api/bible-promises/${encodeURIComponent(selectedPromise.id)}/stream`,
        {
          cache: "no-store",
        },
      );
      const streamPayload = (await streamResponse.json()) as ApiEnvelope<BiblePromiseStreamPayload>;

      if (
        !streamResponse.ok ||
        streamPayload.status !== "success" ||
        !streamPayload.data?.audioUrl
      ) {
        setAudioUrl("");
        setError(streamPayload.message ?? "Nao foi possivel carregar o audio desta promessa.");
        return;
      }

      setAudioUrl(streamPayload.data.audioUrl);

      audio.play(
        [
          {
            id: selectedPromise.id,
            title: buildPromiseLabel(selectedPromise),
            subtitle: selectedPromise.category,
            src: streamPayload.data.audioUrl,
          },
        ],
        0,
      );
    } catch {
      setError("Nao foi possivel conectar ao servidor.");
    } finally {
      setLoading(false);
      window.setTimeout(() => setIsDrawing(false), 850);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="rounded-[24px] border-highlight/25 bg-gradient-to-br from-background via-background to-accent/70 p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-center">
          <div className="mx-auto w-full max-w-[300px]">
            <div className="relative mx-auto aspect-[4/3] w-full">
              <div
                className={cn(
                  "absolute inset-x-8 top-0 h-16 origin-bottom rounded-t-[18px] border border-[#9f6f3f]/35 bg-gradient-to-b from-[#f3dfbd] to-[#ddc197] shadow-[0_9px_20px_-12px_rgba(73,42,15,0.7)] transition-transform duration-500",
                  isDrawing && "-translate-y-2 -rotate-6",
                )}
              />

              <div className="absolute inset-x-0 bottom-0 h-[66%] rounded-[20px] border border-[#744622]/45 bg-gradient-to-b from-[#8f5f35] to-[#6b3f1f] p-2 shadow-[0_18px_28px_-18px_rgba(40,21,9,0.9)]">
                <div className="relative flex size-full items-end justify-center overflow-hidden rounded-[14px] border border-[#5f3718]/40 bg-gradient-to-b from-[#f6e3c0] via-[#f0dcc0] to-[#e7d4bc]">
                  <div
                    className={cn(
                      "absolute inset-x-4 bottom-8 h-12 rounded-md border border-border/40 bg-gradient-to-r from-[#f8f3e6] via-[#f4e8d5] to-[#e9dbca] transition-transform duration-700",
                      isDrawing && "translate-y-2",
                    )}
                  />
                  <div className="absolute inset-x-3 bottom-4 flex items-end justify-center gap-1">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={cn(
                          "h-12 w-9 rounded-sm border border-[#d9c6ab]/70 bg-gradient-to-b from-[#fcf8ef] via-[#f3e9d8] to-[#ece0ce] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.55)] transition-transform duration-700",
                          isDrawing
                            ? index === 2
                              ? "-translate-y-6 -rotate-3"
                              : index % 2 === 0
                                ? "-translate-y-2 rotate-2"
                                : "-translate-y-3 -rotate-2"
                            : "",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-highlight">
              <Sparkles className="size-3.5" />
              Promessas
            </div>

            <div>
              <h3 className="text-3xl font-semibold text-foreground">Receba uma promessa biblica</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Clique no botão para receber a palavra de Deus para sua vida.
              </p>
            </div>

            <Button
              onClick={handleReceivePromise}
              disabled={loading}
              className="h-12 rounded-full px-7"
            >
              {loading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Buscando promessa...
                </>
              ) : (
                <>
                  <Volume2 className="size-4" />
                  Receber promessa
                </>
              )}
            </Button>

            {error ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      {promise ? (
        <Card className="rounded-[24px] border-border/70 bg-background/80 p-5 md:p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Promessa de Deus
            </p>
            <h4 className="text-2xl font-semibold text-foreground">{buildPromiseLabel(promise)}</h4>
            <p className="text-sm font-medium text-highlight">{promise.category}</p>
            <p className="text-base leading-7 text-foreground">{promise.promise}</p>
          </div>
        </Card>
      ) : null}

      {playerPromise ? (
        <AudioPlayer
          title={buildPromiseLabel(playerPromise)}
          description={playerPromise.promise}
          badgeLabel={playerPromise.category}
          tracks={trackList}
        />
      ) : null}
    </div>
  );
}
