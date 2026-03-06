"use client";

import { useMemo, useState } from "react";

import type { Audiobook, AudiobookBookSummary } from "@/lib/audiobooks";
import { sortAudiobookChapters } from "@/lib/audiobooks";
import { useAudio } from "@/components/providers/audio-context";

function buildStreamUrl(trackId: string) {
  return `/api/audiobooks/${encodeURIComponent(trackId)}/stream`;
}

export function useBookSelection(initialAudiobooks: Audiobook[]) {
  const audio = useAudio();

  const [selectedBook, setSelectedBook] = useState<AudiobookBookSummary | null>(null);
  const [selectedBookAudiobooks, setSelectedBookAudiobooks] = useState<Audiobook[]>([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState("");

  const sortedChapters = useMemo(
    () => sortAudiobookChapters(selectedBookAudiobooks),
    [selectedBookAudiobooks],
  );

  function handleSelectBook(book: AudiobookBookSummary) {
    setSelectedBook(book);
    setBookError("");
    setBookLoading(true);

    const sortedItems = sortAudiobookChapters(
      initialAudiobooks.filter((item) => item.book.toLowerCase() === book.slug.toLowerCase()),
    );

    setSelectedBookAudiobooks(sortedItems);

    if (sortedItems.length === 0) {
      setBookError("Nenhum capitulo foi encontrado para este livro.");
      setSelectedBookAudiobooks([]);
      setBookLoading(false);
      return;
    }

    audio.play(
      sortedItems.map((chapter, index) => ({
        id: chapter.id,
        title: `Capitulo ${chapter.chapter}`,
        subtitle: `Faixa ${index + 1} do livro ${book.title}`,
        src: buildStreamUrl(chapter.id),
        progressContentType: "bible",
        progressContentId: chapter.id,
      })),
      0,
    );

    setBookLoading(false);
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
