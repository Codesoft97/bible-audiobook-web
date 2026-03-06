"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { ApiEnvelope } from "@/lib/auth/types";
import type { HistoryContentType, PlaybackProgressSnapshot } from "@/lib/history";

const PROGRESS_SYNC_INTERVAL_SECONDS = 12;

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  src: string;
  progressContentType?: HistoryContentType;
  progressContentId?: string;
}

interface AudioState {
  playlist: AudioTrack[];
  trackIndex: number;
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  muted: boolean;
  error: string;
}

interface AudioActions {
  play: (tracks: AudioTrack[], startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  toggleMute: () => void;
  stop: () => void;
  selectTrack: (index: number) => void;
}

type AudioContextValue = AudioState & AudioActions;

const AudioContext = createContext<AudioContextValue | null>(null);

function resolveTrackProgressTarget(track: AudioTrack | null) {
  if (!track?.progressContentType || !track.progressContentId) {
    return null;
  }

  return {
    contentType: track.progressContentType,
    contentId: track.progressContentId,
  };
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);

  if (!ctx) {
    throw new Error("useAudio must be used within an AudioProvider");
  }

  return ctx;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<AudioTrack | null>(null);
  const pendingResumeRef = useRef<{ trackId: string; seconds: number } | null>(null);
  const resumeRequestRef = useRef(0);
  const progressMarkerRef = useRef<{ trackId: string; second: number } | null>(null);

  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");

  const currentTrack = playlist[trackIndex] ?? null;
  const hasNext = trackIndex < playlist.length - 1;

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  const syncProgress = useCallback((track: AudioTrack | null, position: number, total: number) => {
    const target = resolveTrackProgressTarget(track);

    if (!target || !Number.isFinite(total) || total <= 0 || !Number.isFinite(position)) {
      return;
    }

    const payload = {
      contentType: target.contentType,
      contentId: target.contentId,
      currentPositionSeconds: Math.max(0, Math.floor(position)),
      totalDurationSeconds: Math.max(1, Math.floor(total)),
    };

    void fetch("/api/history/progress", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  }, []);

  const persistCurrentTrackProgress = useCallback(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    syncProgress(currentTrack, audio.currentTime, audio.duration);
    progressMarkerRef.current = {
      trackId: currentTrack.id,
      second: Math.floor(audio.currentTime),
    };
  }, [currentTrack, syncProgress]);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) return;

    setError("");
    setIsBuffering(true);

    void audio.play().catch(() => {
      setError("Nao foi possivel reproduzir o audio.");
      setIsPlaying(false);
      setIsBuffering(false);
    });
  }, []);

  const reloadAndPlay = useCallback(() => {
    setTimeout(() => {
      const audio = audioRef.current;

      if (!audio) return;

      audio.load();
      playAudio();
    }, 0);
  }, [playAudio]);

  const play = useCallback(
    (tracks: AudioTrack[], startIndex = 0) => {
      if (tracks.length === 0) {
        return;
      }

      persistCurrentTrackProgress();

      const safeIndex = Math.min(Math.max(startIndex, 0), tracks.length - 1);
      setPlaylist(tracks);
      setTrackIndex(safeIndex);
      setCurrentTime(0);
      setDuration(0);
      setError("");
      setIsBuffering(true);
      reloadAndPlay();
    },
    [persistCurrentTrackProgress, reloadAndPlay],
  );

  const pause = useCallback(() => {
    persistCurrentTrackProgress();
    audioRef.current?.pause();
  }, [persistCurrentTrackProgress]);

  const resume = useCallback(() => {
    playAudio();
  }, [playAudio]);

  const next = useCallback(() => {
    if (!hasNext) return;

    persistCurrentTrackProgress();
    setTrackIndex((prev) => prev + 1);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    setIsBuffering(true);
    reloadAndPlay();
  }, [hasNext, persistCurrentTrackProgress, reloadAndPlay]);

  const prev = useCallback(() => {
    if (trackIndex <= 0) return;

    persistCurrentTrackProgress();
    setTrackIndex((prevIndex) => prevIndex - 1);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    setIsBuffering(true);
    reloadAndPlay();
  }, [persistCurrentTrackProgress, reloadAndPlay, trackIndex]);

  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;

      if (!audio) return;

      audio.currentTime = time;
      setCurrentTime(time);
      progressMarkerRef.current = {
        trackId: currentTrack?.id ?? "",
        second: Math.floor(time),
      };

      if (currentTrack) {
        syncProgress(currentTrack, time, audio.duration);
      }
    },
    [currentTrack, syncProgress],
  );

  const toggleMute = useCallback(() => {
    setMuted((currentMuted) => {
      const nextMuted = !currentMuted;
      const audio = audioRef.current;

      if (audio) {
        audio.muted = nextMuted;
      }

      return nextMuted;
    });
  }, []);

  const stop = useCallback(() => {
    persistCurrentTrackProgress();

    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    pendingResumeRef.current = null;
    progressMarkerRef.current = null;
    setPlaylist([]);
    setTrackIndex(0);
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentTime(0);
    setDuration(0);
    setError("");
  }, [persistCurrentTrackProgress]);

  const selectTrack = useCallback(
    (index: number) => {
      if (index < 0 || index >= playlist.length) return;

      if (index === trackIndex) {
        if (isPlaying) {
          pause();
        } else {
          resume();
        }
        return;
      }

      persistCurrentTrackProgress();
      setTrackIndex(index);
      setCurrentTime(0);
      setDuration(0);
      setError("");
      setIsBuffering(true);
      reloadAndPlay();
    },
    [isPlaying, pause, persistCurrentTrackProgress, playlist.length, reloadAndPlay, resume, trackIndex],
  );

  const loadSavedProgress = useCallback(async (track: AudioTrack | null) => {
    pendingResumeRef.current = null;

    const target = resolveTrackProgressTarget(track);

    if (!track || !target) {
      return;
    }

    const requestId = ++resumeRequestRef.current;

    try {
      const response = await fetch(
        `/api/history/${encodeURIComponent(target.contentType)}/${encodeURIComponent(target.contentId)}/progress`,
        {
          cache: "no-store",
        },
      );
      const data = (await response.json()) as ApiEnvelope<PlaybackProgressSnapshot | null>;

      if (requestId !== resumeRequestRef.current) {
        return;
      }

      const savedSeconds = data.status === "success" ? data.data?.currentPositionSeconds ?? 0 : 0;

      if (savedSeconds > 0) {
        const activeTrack = currentTrackRef.current;
        const audio = audioRef.current;

        if (
          activeTrack?.id === track.id &&
          audio &&
          Number.isFinite(audio.duration) &&
          audio.duration > 0
        ) {
          const maxSeek = Math.max(0, audio.duration - 1);
          const safeSeek = Math.min(Math.max(0, savedSeconds), maxSeek);

          if (safeSeek > 0) {
            audio.currentTime = safeSeek;
            setCurrentTime(safeSeek);
            progressMarkerRef.current = {
              trackId: track.id,
              second: Math.floor(safeSeek),
            };
          }

          pendingResumeRef.current = null;
          return;
        }

        pendingResumeRef.current = {
          trackId: track.id,
          seconds: savedSeconds,
        };
      }
    } catch {
      pendingResumeRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!currentTrack) {
      pendingResumeRef.current = null;
      progressMarkerRef.current = null;
      return;
    }

    progressMarkerRef.current = {
      trackId: currentTrack.id,
      second: 0,
    };

    void loadSavedProgress(currentTrack);
  }, [currentTrack, loadSavedProgress]);

  const value = useMemo<AudioContextValue>(
    () => ({
      playlist,
      trackIndex,
      currentTrack,
      isPlaying,
      isBuffering,
      currentTime,
      duration,
      muted,
      error,
      play,
      pause,
      resume,
      next,
      prev,
      seek,
      toggleMute,
      stop,
      selectTrack,
    }),
    [
      playlist,
      trackIndex,
      currentTrack,
      isPlaying,
      isBuffering,
      currentTime,
      duration,
      muted,
      error,
      play,
      pause,
      resume,
      next,
      prev,
      seek,
      toggleMute,
      stop,
      selectTrack,
    ],
  );

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        src={currentTrack?.src}
        muted={muted}
        onCanPlay={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlay={() => {
          setIsPlaying(true);
          setIsBuffering(false);
        }}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          const nextTime = e.currentTarget.currentTime;
          const total = e.currentTarget.duration;

          setCurrentTime(nextTime);

          if (!currentTrack || !Number.isFinite(total) || total <= 0) {
            return;
          }

          const nextSecond = Math.floor(nextTime);
          const marker = progressMarkerRef.current;

          if (!marker || marker.trackId !== currentTrack.id) {
            progressMarkerRef.current = {
              trackId: currentTrack.id,
              second: nextSecond,
            };
            return;
          }

          if (nextSecond < marker.second) {
            progressMarkerRef.current = {
              trackId: currentTrack.id,
              second: nextSecond,
            };
            return;
          }

          if (nextSecond - marker.second >= PROGRESS_SYNC_INTERVAL_SECONDS) {
            syncProgress(currentTrack, nextTime, total);
            progressMarkerRef.current = {
              trackId: currentTrack.id,
              second: nextSecond,
            };
          }
        }}
        onLoadedMetadata={(e) => {
          const total = e.currentTarget.duration;
          const safeDuration = Number.isFinite(total) ? total : 0;

          setDuration(safeDuration);

          const pendingResume = pendingResumeRef.current;

          if (!pendingResume || !currentTrack || pendingResume.trackId !== currentTrack.id || safeDuration <= 0) {
            return;
          }

          const maxSeek = Math.max(0, safeDuration - 1);
          const safeSeek = Math.min(Math.max(0, pendingResume.seconds), maxSeek);

          if (safeSeek > 0) {
            e.currentTarget.currentTime = safeSeek;
            setCurrentTime(safeSeek);
            progressMarkerRef.current = {
              trackId: currentTrack.id,
              second: Math.floor(safeSeek),
            };
          }

          pendingResumeRef.current = null;
        }}
        onEnded={() => {
          const audio = audioRef.current;

          if (audio && currentTrack) {
            syncProgress(currentTrack, audio.duration, audio.duration);
          }

          if (hasNext) {
            next();
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
    </AudioContext.Provider>
  );
}
