"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  src: string;
}

interface AudioState {
  /** Current playlist */
  playlist: AudioTrack[];
  /** Index of the active track */
  trackIndex: number;
  /** Currently active track (derived) */
  currentTrack: AudioTrack | null;
  /** Playback flags */
  isPlaying: boolean;
  isBuffering: boolean;
  /** Timing */
  currentTime: number;
  duration: number;
  /** Audio flags */
  muted: boolean;
  /** Error message */
  error: string;
}

interface AudioActions {
  /** Start playing a list of tracks (replaces current playlist) */
  play: (tracks: AudioTrack[], startIndex?: number) => void;
  /** Pause playback */
  pause: () => void;
  /** Resume playback */
  resume: () => void;
  /** Go to next track */
  next: () => void;
  /** Go to previous track */
  prev: () => void;
  /** Seek to a specific time */
  seek: (time: number) => void;
  /** Toggle mute */
  toggleMute: () => void;
  /** Stop and clear the playlist */
  stop: () => void;
  /** Select a specific track by index */
  selectTrack: (index: number) => void;
}

type AudioContextValue = AudioState & AudioActions;

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);

  if (!ctx) {
    throw new Error("useAudio must be used within an AudioProvider");
  }

  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  /* ---- internal helpers ---- */

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

  /* ---- public actions ---- */

  const play = useCallback(
    (tracks: AudioTrack[], startIndex = 0) => {
      setPlaylist(tracks);
      setTrackIndex(startIndex);
      setCurrentTime(0);
      setDuration(0);
      setError("");
      setIsBuffering(true);

      // Need to wait for React to render the new src before playing
      setTimeout(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.load();
        playAudio();
      }, 0);
    },
    [playAudio],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    playAudio();
  }, [playAudio]);

  const next = useCallback(() => {
    if (!hasNext) return;

    const nextIdx = trackIndex + 1;
    setTrackIndex(nextIdx);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    setIsBuffering(true);

    setTimeout(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.load();
      void audio.play().catch(() => {
        setError("Nao foi possivel reproduzir o audio.");
        setIsPlaying(false);
        setIsBuffering(false);
      });
    }, 0);
  }, [hasNext, trackIndex]);

  const prev = useCallback(() => {
    if (trackIndex <= 0) return;

    const prevIdx = trackIndex - 1;
    setTrackIndex(prevIdx);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    setIsBuffering(true);

    setTimeout(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.load();
      void audio.play().catch(() => {
        setError("Nao foi possivel reproduzir o audio.");
        setIsPlaying(false);
        setIsBuffering(false);
      });
    }, 0);
  }, [trackIndex]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      const audio = audioRef.current;
      if (audio) audio.muted = next;
      return next;
    });
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    setPlaylist([]);
    setTrackIndex(0);
    setIsPlaying(false);
    setIsBuffering(false);
    setCurrentTime(0);
    setDuration(0);
    setError("");
  }, []);

  const selectTrack = useCallback(
    (index: number) => {
      if (index < 0 || index >= playlist.length) return;

      if (index === trackIndex) {
        // Toggle play/pause for current track
        if (isPlaying) {
          pause();
        } else {
          resume();
        }
        return;
      }

      setTrackIndex(index);
      setCurrentTime(0);
      setDuration(0);
      setError("");
      setIsBuffering(true);

      setTimeout(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.load();
        void audio.play().catch(() => {
          setError("Nao foi possivel reproduzir o audio.");
          setIsPlaying(false);
          setIsBuffering(false);
        });
      }, 0);
    },
    [playlist.length, trackIndex, isPlaying, pause, resume],
  );

  /* ---- memoized value ---- */

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

      {/* The single, persistent <audio> element — never unmounted */}
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
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          setDuration(Number.isFinite(d) ? d : 0);
        }}
        onEnded={() => {
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
