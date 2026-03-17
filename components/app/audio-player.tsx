"use client";

import {
  AudioLines,
  RotateCcw,
  RotateCw,
  Headphones,
  LoaderCircle,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "@/components/icons";

import { CompletionBadge } from "@/components/app/completion-badge";
import { useAudio } from "@/components/providers/audio-context";
import type { AudioTrack } from "@/components/providers/audio-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type { AudioTrack };

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

function isSamePlaylist(a: AudioTrack[], b: AudioTrack[]) {
  if (a.length !== b.length) return false;
  return a.every((t, i) => t.id === b[i].id);
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface AudioPlayerProps {
  title: string;
  description?: string;
  tracks: AudioTrack[];
  badgeLabel?: string;
  variant?: "default" | "dock";
  getTrackCompletionStatus?: (track: AudioTrack) => boolean | null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AudioPlayer({
  title,
  description,
  tracks,
  badgeLabel,
  variant = "default",
  getTrackCompletionStatus,
}: AudioPlayerProps) {
  const audio = useAudio();
  const isDock = variant === "dock";

  // Check if THIS player's playlist is the active one in the global context
  const isActivePlaylist = isSamePlaylist(audio.playlist, tracks);
  const activeTrackIndex = isActivePlaylist ? audio.trackIndex : -1;
  const isPlaying = isActivePlaylist && audio.isPlaying;
  const isBuffering = isActivePlaylist && audio.isBuffering;
  const currentTime = isActivePlaylist ? audio.currentTime : 0;
  const duration = isActivePlaylist ? audio.duration : 0;
  const error = isActivePlaylist ? audio.error : "";
  const currentTrack = isActivePlaylist ? audio.currentTrack : null;

  const multiTrack = tracks.length > 1;
  const hasPrev = activeTrackIndex > 0;
  const hasNext = activeTrackIndex < tracks.length - 1;
  const canSeek = isActivePlaylist && duration > 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentTrackCompletionStatus = currentTrack ? getTrackCompletionStatus?.(currentTrack) ?? null : null;

  function handlePlay() {
    if (isActivePlaylist) {
      if (audio.isPlaying) {
        audio.pause();
      } else {
        audio.resume();
      }
    } else {
      audio.play(tracks, 0);
    }
  }

  function handleSelectTrack(index: number) {
    if (isActivePlaylist) {
      audio.selectTrack(index);
    } else {
      audio.play(tracks, index);
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!isActivePlaylist || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.seek(ratio * duration);
  }

  function handleSkipBy(seconds: number) {
    if (!canSeek) return;
    const target = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.seek(target);
  }

  const statusLabel = isBuffering
    ? "Carregando"
    : isPlaying
      ? "Tocando"
      : isActivePlaylist
        ? "Pausado"
        : "Pronto";

  return (
    <div className={cn("space-y-4", isDock && "text-primary-foreground")}>
      {/* ---- Main player card ---- */}
      <div
        className={cn(
          "rounded-[28px] border p-4 shadow-glow sm:p-5",
          isDock
            ? "border-primary-foreground/12 bg-gradient-to-r from-[#07233e] via-[#0b2f53] to-[#082846] text-primary-foreground"
            : "border-highlight/25 bg-gradient-to-br from-background via-background to-accent",
        )}
      >
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
              <CompletionBadge completed={currentTrackCompletionStatus} />
              <Badge
                className={cn(
                  isDock
                    ? "border border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground"
                    : "bg-accent/85 text-accent-foreground",
                )}
              >
                {statusLabel}
              </Badge>
            </div>
          </div>

          {/* Now playing info */}
          <div className="space-y-1.5">
            <p
              className={cn(
                "text-[11px] font-medium uppercase tracking-[0.24em]",
                isDock ? "text-primary-foreground/65" : "text-muted-foreground",
              )}
            >
              Agora ouvindo
            </p>
            <h4
              className={cn(
                "text-lg font-semibold leading-tight sm:text-xl md:text-2xl",
                isDock ? "text-primary-foreground" : "text-foreground",
              )}
            >
              {currentTrack ? currentTrack.title : title}
            </h4>
            {description && (
              <p
                className={cn(
                  "text-sm leading-5 sm:leading-6",
                  isDock ? "text-primary-foreground/78" : "text-muted-foreground",
                )}
              >
                {description}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {multiTrack && (
              <Button
                variant={isDock ? "ghost" : "secondary"}
                size="icon"
                className={cn(
                  "size-9 rounded-full sm:size-10",
                  isDock &&
                    "border border-primary-foreground/15 bg-primary-foreground/8 text-primary-foreground hover:bg-primary-foreground/14 hover:text-primary-foreground",
                )}
                onClick={() => isActivePlaylist && audio.prev()}
                disabled={!hasPrev}
                aria-label="Faixa anterior"
              >
                <SkipBack className="size-4" />
              </Button>
            )}

            <Button
              variant={isDock ? "ghost" : "secondary"}
              size="icon"
              className={cn(
                "size-9 rounded-full sm:size-10",
                isDock &&
                  "border border-primary-foreground/15 bg-primary-foreground/8 text-primary-foreground hover:bg-primary-foreground/14 hover:text-primary-foreground",
              )}
              onClick={() => handleSkipBy(-10)}
              disabled={!canSeek || currentTime <= 0}
              aria-label="Voltar 10 segundos"
            >
              <RotateCcw className="size-4" />
            </Button>

            <Button
              size="icon"
              className={cn(
                "size-12 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 sm:size-14",
                isDock && "border border-highlight/45 bg-highlight text-highlight-foreground",
              )}
              onClick={handlePlay}
              disabled={tracks.length === 0}
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

            <Button
              variant={isDock ? "ghost" : "secondary"}
              size="icon"
              className={cn(
                "size-9 rounded-full sm:size-10",
                isDock &&
                  "border border-primary-foreground/15 bg-primary-foreground/8 text-primary-foreground hover:bg-primary-foreground/14 hover:text-primary-foreground",
              )}
              onClick={() => handleSkipBy(10)}
              disabled={!canSeek || currentTime >= duration}
              aria-label="Avancar 10 segundos"
            >
              <RotateCw className="size-4" />
            </Button>

            {multiTrack && (
              <Button
                variant={isDock ? "ghost" : "secondary"}
                size="icon"
                className={cn(
                  "size-9 rounded-full sm:size-10",
                  isDock &&
                    "border border-primary-foreground/15 bg-primary-foreground/8 text-primary-foreground hover:bg-primary-foreground/14 hover:text-primary-foreground",
                )}
                onClick={() => isActivePlaylist && audio.next()}
                disabled={!hasNext}
                aria-label="Proxima faixa"
              >
                <SkipForward className="size-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-8 rounded-full sm:ml-2 sm:size-9",
                isDock
                  ? "text-primary-foreground/75 hover:bg-primary-foreground/14 hover:text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={audio.toggleMute}
              aria-label={audio.muted ? "Ativar som" : "Silenciar"}
            >
              {audio.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </Button>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div
              role="slider"
              tabIndex={0}
              aria-label="Progresso do audio"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              className={cn(
                "group relative h-2 w-full cursor-pointer overflow-hidden rounded-full",
                isDock ? "bg-primary-foreground/12" : "bg-highlight/15",
                (!isActivePlaylist || duration <= 0) && "cursor-not-allowed opacity-50",
              )}
              onClick={handleProgressClick}
            >
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-[width] duration-150",
                  isDock ? "bg-highlight" : "bg-primary",
                )}
                style={{ width: `${progress}%` }}
              />
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 size-3.5 rounded-full border-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100",
                  isDock ? "border-highlight bg-[#0a2745]" : "border-primary bg-background",
                )}
                style={{ left: `calc(${progress}% - 7px)` }}
              />
            </div>
            <div
              className={cn(
                "flex items-center justify-between text-[10px] tabular-nums sm:text-[11px]",
                isDock ? "text-primary-foreground/68" : "text-muted-foreground",
              )}
            >
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
      </div>

      {/* ---- Track list (only for multi-track) ---- */}
      {multiTrack && (
        <div className="space-y-2.5">
          {tracks.map((t, i) => {
            const isCurrent = i === activeTrackIndex;
            const isCurrentPlaying = isCurrent && isPlaying;
            const trackCompletionStatus = getTrackCompletionStatus?.(t) ?? null;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTrack(i)}
                className={cn(
                  "flex w-full flex-col items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition sm:flex-row sm:items-center sm:gap-4",
                  isDock
                    ? isCurrent
                      ? "border-highlight/40 bg-primary-foreground/10"
                      : "border-primary-foreground/12 bg-[#082846] hover:border-highlight/25 hover:bg-primary-foreground/10"
                    : isCurrent
                      ? "border-highlight/40 bg-accent"
                      : "border-border/70 bg-background hover:border-highlight/25 hover:bg-background",
                )}
              >
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
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
                    <p className={cn("truncate font-medium", isDock && "text-primary-foreground")}>
                      {t.title}
                    </p>
                    {t.subtitle && (
                      <p
                        className={cn(
                          "truncate text-sm",
                          isDock ? "text-primary-foreground/68" : "text-muted-foreground",
                        )}
                      >
                        {t.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
                  <CompletionBadge completed={trackCompletionStatus} />
                  <Badge
                    className={cn(
                      isDock
                        ? isCurrent
                          ? "border-highlight/20 bg-highlight/15 text-highlight"
                          : "border-primary-foreground/10 bg-primary-foreground/8 text-primary-foreground"
                        : isCurrent
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "bg-highlight/10 text-highlight",
                    )}
                  >
                    {isCurrentPlaying ? "Tocando" : isCurrent ? "Pausado" : "Ouvir"}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
