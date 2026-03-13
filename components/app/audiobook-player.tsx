"use client";

import { useEffect, useRef, useState } from "react";

import {
  AudioLines,
  Headphones,
  LoaderCircle,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "@/components/icons";

import type { Audiobook } from "@/lib/audiobooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudiobookPlayerProps {
  bookTitle: string;
  tracks: Audiobook[];
}

function formatPlaybackTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
  }

  return [minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function buildStreamUrl(trackId: string) {
  return `/api/audiobooks/${encodeURIComponent(trackId)}/stream`;
}

export function AudiobookPlayer({ bookTitle, tracks }: AudiobookPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Audiobook | null>(tracks[0] ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState("");
  const [shouldAutoplay, setShouldAutoplay] = useState(false);

  const currentTrackIndex = currentTrack
    ? tracks.findIndex((track) => track.id === currentTrack.id)
    : -1;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }

    setCurrentTrack((previousTrack) => {
      if (!previousTrack) {
        return tracks[0] ?? null;
      }

      return tracks.find((track) => track.id === previousTrack.id) ?? tracks[0] ?? null;
    });
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackError("");
    setShouldAutoplay(false);
  }, [tracks]);

  useEffect(() => {
    if (!currentTrack) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.load();

    if (!shouldAutoplay) {
      return;
    }

    let active = true;

    void audio.play().catch(() => {
      if (!active) {
        return;
      }

      setPlaybackError(
        "Nao foi possivel reproduzir este audiobook. Verifique se o backend ja expoe o stream do audio.",
      );
      setIsPlaying(false);
      setIsBuffering(false);
    });

    setShouldAutoplay(false);

    return () => {
      active = false;
    };
  }, [currentTrack, shouldAutoplay]);

  function handleSelectTrack(track: Audiobook) {
    const audio = audioRef.current;

    if (currentTrack?.id === track.id) {
      if (!audio) {
        return;
      }

      setPlaybackError("");

      if (audio.paused) {
        setIsBuffering(true);
        void audio.play().catch(() => {
          setPlaybackError(
            "Nao foi possivel reproduzir este audiobook. Verifique se o backend ja expoe o stream do audio.",
          );
          setIsPlaying(false);
          setIsBuffering(false);
        });
      } else {
        audio.pause();
      }

      return;
    }

    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackError("");
    setIsBuffering(true);
    setShouldAutoplay(true);
  }

  function handleTogglePlayback() {
    if (!currentTrack) {
      return;
    }

    handleSelectTrack(currentTrack);
  }

  function handleSkip(offset: -1 | 1) {
    const nextTrack = tracks[currentTrackIndex + offset];

    if (!nextTrack) {
      return;
    }

    setCurrentTrack(nextTrack);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackError("");
    setIsBuffering(true);
    setShouldAutoplay(true);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] border border-highlight/25 bg-gradient-to-br from-background via-background to-accent/70 p-5 shadow-glow">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-highlight">
              <Headphones className="size-3.5" />
              Player do audiobook
            </div>
            <Badge className="bg-accent/85 text-accent-foreground">
              {isBuffering ? "Carregando" : isPlaying ? "Tocando" : "Pronto"}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Agora ouvindo
            </p>
            <h4 className="text-2xl font-semibold">
              {currentTrack ? `${bookTitle} ${currentTrack.chapter}` : bookTitle}
            </h4>
            <p className="text-sm leading-6 text-muted-foreground">
              Use os controles abaixo ou escolha um capitulo da lista para iniciar a reprodução.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => handleSkip(-1)}
              disabled={currentTrackIndex <= 0}
              aria-label="Capitulo anterior"
            >
              <SkipBack className="size-4" />
            </Button>
            <Button
              size="icon"
              className="size-14 rounded-full"
              onClick={handleTogglePlayback}
              disabled={!currentTrack}
              aria-label={isPlaying ? "Pausar audiobook" : "Reproduzir audiobook"}
            >
              {isBuffering ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="ml-0.5 size-5" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => handleSkip(1)}
              disabled={currentTrackIndex === -1 || currentTrackIndex >= tracks.length - 1}
              aria-label="Proximo capitulo"
            >
              <SkipForward className="size-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 0}
              step={1}
              value={Math.min(currentTime, duration || 0)}
              disabled={!currentTrack || duration <= 0}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-highlight/20 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ accentColor: "hsl(var(--primary))" }}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                const audio = audioRef.current;

                if (!audio) {
                  return;
                }

                audio.currentTime = nextValue;
                setCurrentTime(nextValue);
              }}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatPlaybackTime(currentTime)}</span>
              <span>{formatPlaybackTime(duration)}</span>
            </div>
          </div>

          {playbackError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {playbackError}
            </div>
          ) : (
            <div className="rounded-2xl border border-highlight/20 bg-highlight/10 px-4 py-3 text-sm text-foreground">
              O player usa a rota protegida do frontend para buscar o audio do capitulo atual.
            </div>
          )}
        </div>

        <audio
          ref={audioRef}
          preload="metadata"
          src={currentTrack ? buildStreamUrl(currentTrack.id) : undefined}
          onCanPlay={() => setIsBuffering(false)}
          onWaiting={() => setIsBuffering(true)}
          onPlay={() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => {
            const nextDuration = event.currentTarget.duration;
            setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
          }}
          onEnded={() => {
            const nextTrack = tracks[currentTrackIndex + 1];

            if (nextTrack) {
              setCurrentTrack(nextTrack);
              setCurrentTime(0);
              setDuration(0);
              setPlaybackError("");
              setIsBuffering(true);
              setShouldAutoplay(true);
              return;
            }

            setIsPlaying(false);
            setIsBuffering(false);
          }}
          onError={() => {
            setPlaybackError(
              "Nao foi possivel reproduzir este audiobook. Verifique se o backend ja expoe o stream do audio.",
            );
            setIsPlaying(false);
            setIsBuffering(false);
          }}
        />
      </div>

      <div className="space-y-3">
        {tracks.map((track, index) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          const isCurrentTrackPlaying = isCurrentTrack && isPlaying;

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => handleSelectTrack(track)}
              className={cn(
                "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition",
                isCurrentTrack
                  ? "border-highlight/40 bg-accent/75"
                  : "border-border/70 bg-background/60 hover:border-highlight/25 hover:bg-background/90",
              )}
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-2xl",
                    isCurrentTrack
                      ? "bg-primary text-primary-foreground"
                      : "bg-highlight/12 text-highlight",
                  )}
                >
                  {isCurrentTrackPlaying ? (
                    <AudioLines className="size-5" />
                  ) : (
                    <Play className="ml-0.5 size-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium">
                    Capitulo {track.chapter}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Faixa {index + 1} do livro {bookTitle}
                  </p>
                </div>
              </div>
              <Badge
                className={cn(
                  isCurrentTrack
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "bg-highlight/10 text-highlight",
                )}
              >
                {isCurrentTrackPlaying ? "Tocando" : isCurrentTrack ? "Selecionado" : "Ouvir"}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
