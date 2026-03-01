"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  AudioLines,
  Headphones,
  LoaderCircle,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  src: string;
}

interface AudioPlayerProps {
  /** Player header title */
  title: string;
  /** Optional description shown below the title */
  description?: string;
  /** One or more tracks to play */
  tracks: AudioTrack[];
  /** Optional badge shown next to the header */
  badgeLabel?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "00:00";

  const total = Math.floor(value);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AudioPlayer({
  title,
  description,
  tracks,
  badgeLabel,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);

  const track = tracks[trackIndex] ?? null;
  const hasPrev = trackIndex > 0;
  const hasNext = trackIndex < tracks.length - 1;
  const multiTrack = tracks.length > 1;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* Reset when tracks change (e.g. user selects a different book) */
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();

    setTrackIndex(0);
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    setShouldAutoplay(false);
  }, [tracks]);

  /* Autoplay after programmatic track change */
  useEffect(() => {
    if (!track || !shouldAutoplay) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    let active = true;

    void audio.play().catch(() => {
      if (!active) return;
      setError("Nao foi possivel reproduzir o audio. Tente novamente.");
      setIsPlaying(false);
      setIsBuffering(false);
    });

    setShouldAutoplay(false);
    return () => {
      active = false;
    };
  }, [track, shouldAutoplay]);

  /* ---- playback controls ---- */

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    setError("");

    if (audio.paused) {
      setIsBuffering(true);
      void audio.play().catch(() => {
        setError("Nao foi possivel reproduzir o audio. Tente novamente.");
        setIsPlaying(false);
        setIsBuffering(false);
      });
    } else {
      audio.pause();
    }
  }, [track]);

  function goTo(offset: -1 | 1) {
    const nextIndex = trackIndex + offset;
    if (nextIndex < 0 || nextIndex >= tracks.length) return;

    setTrackIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    setIsBuffering(true);
    setShouldAutoplay(true);
  }

  function selectTrack(index: number) {
    if (index === trackIndex) {
      togglePlayback();
      return;
    }

    setTrackIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    setIsBuffering(true);
    setShouldAutoplay(true);
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || duration <= 0) return;

    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const nextTime = ratio * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  /* ---- status label ---- */
  const statusLabel = isBuffering ? "Carregando" : isPlaying ? "Tocando" : "Pronto";

  return (
    <div className="space-y-4">
      {/* ---- Main player card ---- */}
      <div className="rounded-[28px] border border-highlight/25 bg-gradient-to-br from-background via-background to-accent/70 p-5 shadow-glow">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-highlight">
              <Headphones className="size-3.5" />
              Player
            </div>
            <div className="flex items-center gap-2">
              {badgeLabel && (
                <Badge className="bg-highlight/10 text-highlight">{badgeLabel}</Badge>
              )}
              <Badge className="bg-accent/85 text-accent-foreground">{statusLabel}</Badge>
            </div>
          </div>

          {/* Now playing info */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Agora ouvindo
            </p>
            <h4 className="text-xl font-semibold leading-tight sm:text-2xl">
              {track ? track.title : title}
            </h4>
            {description && (
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {multiTrack && (
              <Button
                variant="secondary"
                size="icon"
                className="size-10 rounded-full"
                onClick={() => goTo(-1)}
                disabled={!hasPrev}
                aria-label="Faixa anterior"
              >
                <SkipBack className="size-4" />
              </Button>
            )}

            <Button
              size="icon"
              className="size-14 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95"
              onClick={togglePlayback}
              disabled={!track}
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isBuffering ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="ml-0.5 size-5" />
              )}
            </Button>

            {multiTrack && (
              <Button
                variant="secondary"
                size="icon"
                className="size-10 rounded-full"
                onClick={() => goTo(1)}
                disabled={!hasNext}
                aria-label="Proxima faixa"
              >
                <SkipForward className="size-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="ml-2 size-9 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => {
                setMuted((m) => !m);
                const audio = audioRef.current;
                if (audio) audio.muted = !muted;
              }}
              aria-label={muted ? "Ativar som" : "Silenciar"}
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </Button>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div
              ref={progressRef}
              role="slider"
              tabIndex={0}
              aria-label="Progresso do audio"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              className={cn(
                "group relative h-2 w-full cursor-pointer overflow-hidden rounded-full bg-highlight/15",
                (!track || duration <= 0) && "cursor-not-allowed opacity-50",
              )}
              onClick={handleProgressClick}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 size-3.5 rounded-full border-2 border-primary bg-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                style={{ left: `calc(${progress}% - 7px)` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] tabular-nums text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          preload="metadata"
          src={track?.src}
          muted={muted}
          onCanPlay={() => setIsBuffering(false)}
          onWaiting={() => setIsBuffering(true)}
          onPlay={() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            setDuration(Number.isFinite(d) ? d : 0);
          }}
          onEnded={() => {
            if (hasNext) {
              goTo(1);
              return;
            }
            setIsPlaying(false);
            setIsBuffering(false);
          }}
          onError={() => {
            setError("Nao foi possivel reproduzir o audio. Tente novamente.");
            setIsPlaying(false);
            setIsBuffering(false);
          }}
        />
      </div>

      {/* ---- Track list (only for multi-track) ---- */}
      {multiTrack && (
        <div className="space-y-2.5">
          {tracks.map((t, i) => {
            const isCurrent = i === trackIndex;
            const isCurrentPlaying = isCurrent && isPlaying;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTrack(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition",
                  isCurrent
                    ? "border-highlight/40 bg-accent/75"
                    : "border-border/70 bg-background/60 hover:border-highlight/25 hover:bg-background/90",
                )}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-highlight/12 text-highlight",
                    )}
                  >
                    {isCurrentPlaying ? (
                      <AudioLines className="size-4" />
                    ) : (
                      <Play className="ml-0.5 size-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.title}</p>
                    {t.subtitle && (
                      <p className="truncate text-sm text-muted-foreground">{t.subtitle}</p>
                    )}
                  </div>
                </div>
                <Badge
                  className={cn(
                    "shrink-0",
                    isCurrent
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "bg-highlight/10 text-highlight",
                  )}
                >
                  {isCurrentPlaying ? "Tocando" : isCurrent ? "Selecionado" : "Ouvir"}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
