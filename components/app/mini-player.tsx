"use client";

import {
  AudioLines,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

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

  if (!audio.currentTrack) return null;

  const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
  const multiTrack = audio.playlist.length > 1;
  const hasPrev = audio.trackIndex > 0;
  const hasNext = audio.trackIndex < audio.playlist.length - 1;

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (audio.duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.seek(ratio * audio.duration);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-full duration-300">
      {/* Progress bar on top edge */}
      <div
        className="group h-1.5 w-full cursor-pointer bg-muted/40 transition-[height] hover:h-2.5"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-primary transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Player body */}
      <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6">
          {/* Track info */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <AudioLines className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{audio.currentTrack.title}</p>
              {audio.currentTrack.subtitle && (
                <p className="truncate text-xs text-muted-foreground">
                  {audio.currentTrack.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {multiTrack && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={audio.prev}
                disabled={!hasPrev}
                aria-label="Faixa anterior"
              >
                <SkipBack className="size-3.5" />
              </Button>
            )}

            <Button
              size="icon"
              className={cn(
                "size-10 rounded-full shadow-sm transition-transform hover:scale-105 active:scale-95",
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

            {multiTrack && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={audio.next}
                disabled={!hasNext}
                aria-label="Proxima faixa"
              >
                <SkipForward className="size-3.5" />
              </Button>
            )}
          </div>

          {/* Time + volume + close */}
          <div className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
            <span className="hidden sm:inline">
              {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={audio.toggleMute}
              aria-label={audio.muted ? "Ativar som" : "Silenciar"}
            >
              {audio.muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={audio.stop}
              aria-label="Fechar player"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
