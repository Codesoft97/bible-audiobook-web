"use client";

import { useMemo, useState } from "react";

import type { Audiobook, AudiobookBookSummary } from "@/lib/audiobooks";
import { sortAudiobookChapters } from "@/lib/audiobooks";
import type { ApiEnvelope } from "@/lib/auth/types";

export function useBookSelection() {
  const [selectedBook, setSelectedBook] = useState<AudiobookBookSummary | null>(null);
  const [selectedBookAudiobooks, setSelectedBookAudiobooks] = useState<Audiobook[]>([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState("");

  const sortedChapters = useMemo(
    () => sortAudiobookChapters(selectedBookAudiobooks),
    [selectedBookAudiobooks],
  );

  async function handleSelectBook(book: AudiobookBookSummary) {
    setSelectedBook(book);
    setBookError("");
    setBookLoading(true);

    try {
      const response = await fetch(`/api/audiobooks?book=${encodeURIComponent(book.slug)}`);
      const data = (await response.json()) as ApiEnvelope<Audiobook[]>;

      if (!response.ok || data.status !== "success" || !data.data) {
        setBookError(data.message ?? "Nao foi possivel carregar os capitulos deste livro.");
        setSelectedBookAudiobooks([]);
        return;
      }

      setSelectedBookAudiobooks(data.data);
    } catch {
      setBookError("Nao foi possivel conectar ao servidor.");
      setSelectedBookAudiobooks([]);
    } finally {
      setBookLoading(false);
    }
  }

  function clearBook() {
    setSelectedBook(null);
    setSelectedBookAudiobooks([]);
    setBookError("");
  }

  return {
    selectedBook,
    sortedChapters,
    bookLoading,
    bookError,
    handleSelectBook,
    clearBook,
  };
}
