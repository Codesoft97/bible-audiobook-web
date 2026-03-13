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
import { Howl } from "howler";

import type { ApiEnvelope } from "@/lib/auth/types";
import type { HistoryContentType, PlaybackProgressSnapshot } from "@/lib/history";

const PROGRESS_SYNC_INTERVAL_SECONDS = 12;
const PLAYBACK_SAMPLE_INTERVAL_MS = 500;

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

function readHowlCurrentTime(howl: Howl) {
  const value = howl.seek();
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readHowlDuration(howl: Howl) {
  const value = howl.duration();
  return Number.isFinite(value) ? value : 0;
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);

  if (!ctx) {
    throw new Error("useAudio must be used within an AudioProvider");
  }

  return ctx;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const howlRef = useRef<Howl | null>(null);
  const shouldAutoplayRef = useRef(false);
  const currentTrackRef = useRef<AudioTrack | null>(null);
  const playlistRef = useRef<AudioTrack[]>([]);
  const trackIndexRef = useRef(0);
  const mutedRef = useRef(false);
  const pendingResumeRef = useRef<{ trackId: string; seconds: number } | null>(null);
  const resumeRequestRef = useRef(0);
  const progressMarkerRef = useRef<{ trackId: string; second: number } | null>(null);
  const progressTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    playlistRef.current = playlist;
    trackIndexRef.current = trackIndex;
  }, [playlist, trackIndex]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

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

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const clearPlaybackError = useCallback(() => {
    setError((currentError) => (currentError ? "" : currentError));
  }, []);

  const persistCurrentTrackProgress = useCallback(() => {
    const howl = howlRef.current;
    const track = currentTrackRef.current;

    if (!howl || !track) {
      return;
    }

    const position = readHowlCurrentTime(howl);
    const total = readHowlDuration(howl);

    syncProgress(track, position, total);
    progressMarkerRef.current = {
      trackId: track.id,
      second: Math.floor(position),
    };
  }, [syncProgress]);

  const sampleAndSyncProgress = useCallback(() => {
    const howl = howlRef.current;
    const track = currentTrackRef.current;

    if (!howl || !track) {
      return;
    }

    const nextTime = readHowlCurrentTime(howl);
    const total = readHowlDuration(howl);

    if (nextTime > 0 || howl.playing()) {
      clearPlaybackError();
    }

    setCurrentTime(nextTime);

    if (!Number.isFinite(total) || total <= 0) {
      return;
    }

    const nextSecond = Math.floor(nextTime);
    const marker = progressMarkerRef.current;

    if (!marker || marker.trackId !== track.id) {
      progressMarkerRef.current = {
        trackId: track.id,
        second: nextSecond,
      };
      return;
    }

    if (nextSecond < marker.second) {
      progressMarkerRef.current = {
        trackId: track.id,
        second: nextSecond,
      };
      return;
    }

    if (nextSecond - marker.second >= PROGRESS_SYNC_INTERVAL_SECONDS) {
      syncProgress(track, nextTime, total);
      progressMarkerRef.current = {
        trackId: track.id,
        second: nextSecond,
      };
    }
  }, [clearPlaybackError, syncProgress]);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    progressTimerRef.current = window.setInterval(() => {
      sampleAndSyncProgress();
    }, PLAYBACK_SAMPLE_INTERVAL_MS);
  }, [sampleAndSyncProgress, stopProgressTimer]);

  const clearHowl = useCallback(() => {
    stopProgressTimer();

    const howl = howlRef.current;

    if (howl) {
      howl.off();
      howl.unload();
    }

    howlRef.current = null;
  }, [stopProgressTimer]);

  const applyPendingResume = useCallback((track: AudioTrack, howl: Howl) => {
    const pendingResume = pendingResumeRef.current;

    if (!pendingResume || pendingResume.trackId !== track.id) {
      return;
    }

    const total = readHowlDuration(howl);

    if (total <= 0) {
      return;
    }

    const maxSeek = Math.max(0, total - 1);
    const safeSeek = Math.min(Math.max(0, pendingResume.seconds), maxSeek);

    if (safeSeek > 0) {
      howl.seek(safeSeek);
      setCurrentTime(safeSeek);
      progressMarkerRef.current = {
        trackId: track.id,
        second: Math.floor(safeSeek),
      };
    }

    pendingResumeRef.current = null;
  }, []);

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
        const howl = howlRef.current;

        if (activeTrack?.id === track.id && howl && howl.state() === "loaded") {
          const total = readHowlDuration(howl);

          if (total > 0) {
            const maxSeek = Math.max(0, total - 1);
            const safeSeek = Math.min(Math.max(0, savedSeconds), maxSeek);

            if (safeSeek > 0) {
              howl.seek(safeSeek);
              setCurrentTime(safeSeek);
              progressMarkerRef.current = {
                trackId: track.id,
                second: Math.floor(safeSeek),
              };
            }

            pendingResumeRef.current = null;
            return;
          }
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

  const play = useCallback(
    (tracks: AudioTrack[], startIndex = 0) => {
      if (tracks.length === 0) {
        return;
      }

      persistCurrentTrackProgress();

      const safeIndex = Math.min(Math.max(startIndex, 0), tracks.length - 1);
      shouldAutoplayRef.current = true;
      setPlaylist(tracks);
      setTrackIndex(safeIndex);
      setCurrentTime(0);
      setDuration(0);
      setError("");
      setIsBuffering(true);
    },
    [persistCurrentTrackProgress],
  );

  const pause = useCallback(() => {
    persistCurrentTrackProgress();
    howlRef.current?.pause();
  }, [persistCurrentTrackProgress]);

  const resume = useCallback(() => {
    const howl = howlRef.current;

    if (!howl) {
      return;
    }

    setError("");
    setIsBuffering(true);
    howl.play();
  }, []);

  const next = useCallback(() => {
    if (!hasNext) {
      return;
    }

    persistCurrentTrackProgress();
    shouldAutoplayRef.current = true;
    setTrackIndex((prev) => prev + 1);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    setIsBuffering(true);
  }, [hasNext, persistCurrentTrackProgress]);

  const prev = useCallback(() => {
    if (trackIndex <= 0) {
      return;
    }

    persistCurrentTrackProgress();
    shouldAutoplayRef.current = true;
    setTrackIndex((prevIndex) => prevIndex - 1);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    setIsBuffering(true);
  }, [persistCurrentTrackProgress, trackIndex]);

  const seek = useCallback(
    (time: number) => {
      const howl = howlRef.current;

      if (!howl) {
        return;
      }

      const safeTime = Math.max(0, time);

      howl.seek(safeTime);
      setCurrentTime(safeTime);

      const activeTrack = currentTrackRef.current;

      progressMarkerRef.current = {
        trackId: activeTrack?.id ?? "",
        second: Math.floor(safeTime),
      };

      if (activeTrack) {
        syncProgress(activeTrack, safeTime, readHowlDuration(howl));
      }
    },
    [syncProgress],
  );

  const toggleMute = useCallback(() => {
    setMuted((currentMuted) => {
      const nextMuted = !currentMuted;
      const howl = howlRef.current;

      if (howl) {
        howl.mute(nextMuted);
      }

      return nextMuted;
    });
  }, []);

  const stop = useCallback(() => {
    persistCurrentTrackProgress();
    shouldAutoplayRef.current = false;
    clearHowl();

    pendingResumeRef.current = null;
    progressMarkerRef.current = null;
    setPlaylist([]);
    setTrackIndex(0);
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentTime(0);
    setDuration(0);
    setError("");
  }, [clearHowl, persistCurrentTrackProgress]);

  const selectTrack = useCallback(
    (index: number) => {
      if (index < 0 || index >= playlist.length) {
        return;
      }

      if (index === trackIndex) {
        if (isPlaying) {
          pause();
        } else {
          resume();
        }
        return;
      }

      persistCurrentTrackProgress();
      shouldAutoplayRef.current = true;
      setTrackIndex(index);
      setCurrentTime(0);
      setDuration(0);
      setError("");
      setIsBuffering(true);
    },
    [isPlaying, pause, persistCurrentTrackProgress, playlist.length, resume, trackIndex],
  );

  useEffect(() => {
    clearHowl();

    if (!currentTrack) {
      pendingResumeRef.current = null;
      progressMarkerRef.current = null;
      setIsPlaying(false);
      setIsBuffering(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    progressMarkerRef.current = {
      trackId: currentTrack.id,
      second: 0,
    };

    setCurrentTime(0);
    setDuration(0);
    setError("");

    void loadSavedProgress(currentTrack);

    const trackId = currentTrack.id;

    const howl = new Howl({
      src: [currentTrack.src],
      html5: true,
      preload: true,
      mute: mutedRef.current,
      onload: () => {
        if (currentTrackRef.current?.id !== trackId || howlRef.current !== howl) {
          return;
        }

        clearPlaybackError();
        setDuration(readHowlDuration(howl));

        const activeTrack = currentTrackRef.current;

        if (activeTrack) {
          applyPendingResume(activeTrack, howl);
        }
      },
      onplay: () => {
        if (currentTrackRef.current?.id !== trackId || howlRef.current !== howl) {
          return;
        }

        clearPlaybackError();
        setIsPlaying(true);
        setIsBuffering(false);
        setDuration(readHowlDuration(howl));
        startProgressTimer();
        sampleAndSyncProgress();

        const activeTrack = currentTrackRef.current;

        if (activeTrack) {
          applyPendingResume(activeTrack, howl);
        }
      },
      onpause: () => {
        if (currentTrackRef.current?.id !== trackId || howlRef.current !== howl) {
          return;
        }

        setIsPlaying(false);
        setIsBuffering(false);
        stopProgressTimer();
        sampleAndSyncProgress();
      },
      onstop: () => {
        if (currentTrackRef.current?.id !== trackId || howlRef.current !== howl) {
          return;
        }

        setIsPlaying(false);
        setIsBuffering(false);
        stopProgressTimer();
      },
      onend: () => {
        if (currentTrackRef.current?.id !== trackId || howlRef.current !== howl) {
          return;
        }

        stopProgressTimer();

        const activeTrack = currentTrackRef.current;
        const total = readHowlDuration(howl);

        if (activeTrack) {
          syncProgress(activeTrack, total, total);
          progressMarkerRef.current = {
            trackId: activeTrack.id,
            second: Math.floor(total),
          };
        }

        const canAdvance = trackIndexRef.current < playlistRef.current.length - 1;

        if (canAdvance) {
          shouldAutoplayRef.current = true;
          setTrackIndex((prev) => prev + 1);
          setCurrentTime(0);
          setDuration(0);
          setError("");
          setIsBuffering(true);
          return;
        }

        setIsPlaying(false);
        setIsBuffering(false);
        setCurrentTime(total);
      },
      onloaderror: () => {
        if (currentTrackRef.current?.id !== trackId || howlRef.current !== howl) {
          return;
        }

        setError("Nao foi possivel reproduzir o audio. Tente novamente.");
        setIsPlaying(false);
        setIsBuffering(false);
        stopProgressTimer();
      },
      onplayerror: () => {
        if (currentTrackRef.current?.id !== trackId || howlRef.current !== howl) {
          return;
        }

        setError("Nao foi possivel reproduzir o audio.");
        setIsPlaying(false);
        setIsBuffering(false);
        stopProgressTimer();
      },
    });

    howlRef.current = howl;
    setIsBuffering(true);

    if (shouldAutoplayRef.current) {
      shouldAutoplayRef.current = false;
      howl.play();
    } else {
      setIsPlaying(false);
      setIsBuffering(false);
    }

    return () => {
      if (howlRef.current === howl) {
        clearHowl();
        return;
      }

      howl.off();
      howl.unload();
    };
  }, [
    applyPendingResume,
    clearHowl,
    clearPlaybackError,
    currentTrack,
    loadSavedProgress,
    sampleAndSyncProgress,
    startProgressTimer,
    stopProgressTimer,
    syncProgress,
  ]);

  useEffect(() => {
    return () => {
      persistCurrentTrackProgress();
      clearHowl();
    };
  }, [clearHowl, persistCurrentTrackProgress]);

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

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}
