"use client";

import { useEffect } from "react";

import {
  AudioLines,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "@/components/icons";

import { useAudio } from "@/components/providers/audio-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";

  const total = Math.floor(value);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PersistentMiniPlayer() {
  const audio = useAudio();

  useEffect(() => {
    const hasTrack = Boolean(audio.currentTrack);

    document.body.classList.toggle("mini-player-visible", hasTrack);

    return () => {
      document.body.classList.remove("mini-player-visible");
    };
  }, [audio.currentTrack]);

  if (!audio.currentTrack) return null;

  const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
  const multiTrack = audio.playlist.length > 1;
  const hasPrev = audio.trackIndex > 0;
  const hasNext = audio.trackIndex < audio.playlist.length - 1;
  const canSeek = audio.duration > 0;

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (audio.duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.seek(ratio * audio.duration);
  }

  function handleSkipBy(seconds: number) {
    if (!canSeek) return;
    const target = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
    audio.seek(target);
  }

  return (
    <div className="mini-player-shell fixed inset-x-0 bottom-0 z-50 px-0 sm:px-2 lg:px-4">
      <div className="mx-auto max-w-[1500px]">
        <div className="overflow-hidden border border-primary/40 bg-gradient-to-r from-[#07233e] via-[#0b2f53] to-[#082846] text-primary-foreground shadow-[0_-18px_46px_-24px_rgba(7,16,31,0.95)] lg:rounded-t-[18px]">
          <div
            className="group h-1.5 w-full cursor-pointer bg-highlight/20 transition-[height] hover:h-2.5"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-highlight transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5 px-3 py-3 sm:px-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
            <div className="flex min-w-0 items-center gap-3 md:-ml-1 md:px-1.5 md:py-1">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-highlight/45 bg-highlight/20 text-highlight">
                <AudioLines className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{audio.currentTrack.title}</p>
                {audio.currentTrack.subtitle ? (
                  <p className="truncate text-xs text-primary-foreground/75">
                    {audio.currentTrack.subtitle}
                  </p>
                ) : multiTrack ? (
                  <p className="truncate text-xs text-primary-foreground/75">
                    {audio.playlist.length} faixas na fila atual
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {multiTrack && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:size-9"
                  onClick={audio.prev}
                  disabled={!hasPrev}
                  aria-label="Faixa anterior"
                >
                  <SkipBack className="size-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:size-9"
                onClick={() => handleSkipBy(-10)}
                disabled={!canSeek || audio.currentTime <= 0}
                aria-label="Voltar 10 segundos"
              >
                <RotateCcw className="size-4" />
              </Button>

              <Button
                size="icon"
                className={cn(
                  "size-10 rounded-full border border-highlight/50 bg-highlight text-highlight-foreground shadow-[0_8px_18px_-10px_rgba(0,0,0,0.7)] transition-transform hover:scale-105 active:scale-95 sm:size-11",
                  audio.isBuffering && "animate-pulse",
                )}
                onClick={audio.isPlaying ? audio.pause : audio.resume}
                aria-label={audio.isPlaying ? "Pausar" : "Reproduzir"}
              >
                {audio.isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="ml-0.5 size-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:size-9"
                onClick={() => handleSkipBy(10)}
                disabled={!canSeek || audio.currentTime >= audio.duration}
                aria-label="Avancar 10 segundos"
              >
                <RotateCw className="size-4" />
              </Button>

              {multiTrack && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:size-9"
                  onClick={audio.next}
                  disabled={!hasNext}
                  aria-label="Proxima faixa"
                >
                  <SkipForward className="size-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-end gap-1 text-[11px] tabular-nums text-primary-foreground/80">
              <span className="hidden sm:inline">
                {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-primary-foreground/85 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                onClick={audio.toggleMute}
                aria-label={audio.muted ? "Ativar som" : "Silenciar"}
              >
                {audio.muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-primary-foreground/85 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                onClick={audio.stop}
                aria-label="Fechar player"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
