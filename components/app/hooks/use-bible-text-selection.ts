"use client";

import { useEffect, useRef, useState } from "react";

import type { ConfirmationModalRequest } from "@/components/app/hooks/use-confirmation-modal";
import type { ApiEnvelope } from "@/lib/auth/types";
import {
  buildBibleTextChapterCacheKey,
  buildBibleTextHighlightsCacheKey,
  clampBibleTextFontScale,
  type BibleTextBook,
  type BibleTextChapter,
  type BibleTextHighlight,
  type BibleTextReadingState,
  type BibleTextReadingStateUpdateInput,
} from "@/lib/bible-text";

const SHARED_CHAPTER_CACHE_LIMIT = 120;
const SHARED_HIGHLIGHTS_CACHE_LIMIT = 80;
const FONT_SCALE_SAVE_DEBOUNCE_MS = 450;

const DEFAULT_READING_STATE: BibleTextReadingState = {
  translation: "nvi",
  fontScale: 1,
  lastRead: null,
};

interface ChapterRequestResult {
  chapter: BibleTextChapter | null;
  error: string;
}

interface ReadingStateRequestResult {
  state: BibleTextReadingState | null;
  error: string;
}

interface HighlightsRequestResult {
  highlights: BibleTextHighlight[] | null;
  error: string;
}

// Share cached chapter/state data across view changes and collapse duplicate requests.
const sharedChapterCache = new Map<string, BibleTextChapter>();
const sharedChapterRequests = new Map<string, Promise<ChapterRequestResult>>();
const sharedHighlightsCache = new Map<string, BibleTextHighlight[]>();
const sharedHighlightsRequests = new Map<string, Promise<HighlightsRequestResult>>();

let sharedReadingStateCache: BibleTextReadingState | undefined;
let sharedReadingStateRequest: Promise<ReadingStateRequestResult> | null = null;
let sharedAllHighlightsCache: BibleTextHighlight[] | undefined;
let sharedAllHighlightsRequest: Promise<HighlightsRequestResult> | null = null;

function readSharedChapter(chapterKey: string) {
  const cachedChapter = sharedChapterCache.get(chapterKey);

  if (!cachedChapter) {
    return null;
  }

  sharedChapterCache.delete(chapterKey);
  sharedChapterCache.set(chapterKey, cachedChapter);
  return cachedChapter;
}

function writeSharedChapter(chapterKey: string, chapter: BibleTextChapter) {
  if (sharedChapterCache.has(chapterKey)) {
    sharedChapterCache.delete(chapterKey);
  }

  sharedChapterCache.set(chapterKey, chapter);

  if (sharedChapterCache.size <= SHARED_CHAPTER_CACHE_LIMIT) {
    return;
  }

  const oldestChapterKey = sharedChapterCache.keys().next().value;

  if (oldestChapterKey) {
    sharedChapterCache.delete(oldestChapterKey);
  }
}

function readSharedHighlights(highlightsKey: string) {
  const cachedHighlights = sharedHighlightsCache.get(highlightsKey);

  if (!cachedHighlights) {
    return null;
  }

  const copy = [...cachedHighlights];
  sharedHighlightsCache.delete(highlightsKey);
  sharedHighlightsCache.set(highlightsKey, copy);
  return copy;
}

function writeSharedHighlights(highlightsKey: string, highlights: BibleTextHighlight[]) {
  if (sharedHighlightsCache.has(highlightsKey)) {
    sharedHighlightsCache.delete(highlightsKey);
  }

  sharedHighlightsCache.set(highlightsKey, [...highlights]);

  if (sharedHighlightsCache.size <= SHARED_HIGHLIGHTS_CACHE_LIMIT) {
    return;
  }

  const oldestHighlightsKey = sharedHighlightsCache.keys().next().value;

  if (oldestHighlightsKey) {
    sharedHighlightsCache.delete(oldestHighlightsKey);
  }
}

function readSharedAllHighlights() {
  return sharedAllHighlightsCache ? [...sharedAllHighlightsCache] : null;
}

function writeSharedAllHighlights(highlights: BibleTextHighlight[]) {
  sharedAllHighlightsCache = [...highlights].sort(sortHighlights);
}

async function fetchBibleTextChapter(
  abbrev: string,
  chapterNumber: number,
): Promise<ChapterRequestResult> {
  try {
    const response = await fetch(
      `/api/bible-text/books/${encodeURIComponent(abbrev)}/chapters/${chapterNumber}`,
      {
        cache: "no-store",
      },
    );
    const payload = (await response.json()) as ApiEnvelope<BibleTextChapter>;

    if (!response.ok || payload.status !== "success" || !payload.data) {
      return {
        chapter: null,
        error: payload.message ?? "Nao foi possivel carregar o capitulo.",
      };
    }

    return {
      chapter: payload.data,
      error: "",
    };
  } catch {
    return {
      chapter: null,
      error: "Nao foi possivel carregar o capitulo.",
    };
  }
}

function requestChapter(abbrev: string, chapterNumber: number) {
  const chapterKey = buildBibleTextChapterCacheKey(abbrev, chapterNumber);
  const cachedChapter = readSharedChapter(chapterKey);

  if (cachedChapter) {
    return Promise.resolve({
      chapter: cachedChapter,
      error: "",
    } satisfies ChapterRequestResult);
  }

  const pendingRequest = sharedChapterRequests.get(chapterKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = fetchBibleTextChapter(abbrev, chapterNumber)
    .then((result) => {
      if (result.chapter) {
        writeSharedChapter(chapterKey, result.chapter);
      }

      return result;
    })
    .finally(() => {
      sharedChapterRequests.delete(chapterKey);
    });

  sharedChapterRequests.set(chapterKey, request);
  return request;
}

function prefetchChapter(abbrev: string, chapterNumber: number | null) {
  if (!chapterNumber || chapterNumber < 1) {
    return;
  }

  const chapterKey = buildBibleTextChapterCacheKey(abbrev, chapterNumber);

  if (sharedChapterCache.has(chapterKey) || sharedChapterRequests.has(chapterKey)) {
    return;
  }

  void requestChapter(abbrev, chapterNumber);
}

async function fetchBibleTextReadingStateRequest(): Promise<ReadingStateRequestResult> {
  try {
    const response = await fetch("/api/bible-text/me/state", {
      cache: "no-store",
    });
    const payload = (await response.json()) as ApiEnvelope<BibleTextReadingState>;

    if (!response.ok || payload.status !== "success" || !payload.data) {
      return {
        state: null,
        error: payload.message ?? "Nao foi possivel carregar o estado de leitura.",
      };
    }

    return {
      state: payload.data,
      error: "",
    };
  } catch {
    return {
      state: null,
      error: "Nao foi possivel carregar o estado de leitura.",
    };
  }
}

function requestReadingState() {
  if (sharedReadingStateCache) {
    return Promise.resolve({
      state: sharedReadingStateCache,
      error: "",
    } satisfies ReadingStateRequestResult);
  }

  if (sharedReadingStateRequest) {
    return sharedReadingStateRequest;
  }

  sharedReadingStateRequest = fetchBibleTextReadingStateRequest()
    .then((result) => {
      if (result.state) {
        sharedReadingStateCache = result.state;
      }

      return result;
    })
    .finally(() => {
      sharedReadingStateRequest = null;
    });

  return sharedReadingStateRequest;
}

async function patchReadingState(
  payload: BibleTextReadingStateUpdateInput,
): Promise<ReadingStateRequestResult> {
  try {
    const response = await fetch("/api/bible-text/me/state", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as ApiEnvelope<BibleTextReadingState>;

    if (!response.ok || result.status !== "success" || !result.data) {
      return {
        state: null,
        error: result.message ?? "Nao foi possivel salvar suas preferencias de leitura.",
      };
    }

    sharedReadingStateCache = result.data;

    return {
      state: result.data,
      error: "",
    };
  } catch {
    return {
      state: null,
      error: "Nao foi possivel salvar suas preferencias de leitura.",
    };
  }
}

async function fetchBibleTextHighlightsRequest(
  abbrev: string,
  chapterNumber: number,
): Promise<HighlightsRequestResult> {
  try {
    const response = await fetch(
      `/api/bible-text/me/highlights?abbrev=${encodeURIComponent(abbrev)}&chapter=${chapterNumber}`,
      {
        cache: "no-store",
      },
    );
    const payload = (await response.json()) as ApiEnvelope<BibleTextHighlight[]>;

    if (!response.ok || payload.status !== "success" || !payload.data) {
      return {
        highlights: null,
        error: payload.message ?? "Nao foi possivel carregar os destaques do capitulo.",
      };
    }

    return {
      highlights: payload.data,
      error: "",
    };
  } catch {
    return {
      highlights: null,
      error: "Nao foi possivel carregar os destaques do capitulo.",
    };
  }
}

async function fetchBibleTextAllHighlightsRequest(): Promise<HighlightsRequestResult> {
  try {
    const response = await fetch("/api/bible-text/me/highlights", {
      cache: "no-store",
    });
    const payload = (await response.json()) as ApiEnvelope<BibleTextHighlight[]>;

    if (!response.ok || payload.status !== "success" || !payload.data) {
      return {
        highlights: null,
        error: payload.message ?? "Nao foi possivel carregar os destaques salvos.",
      };
    }

    return {
      highlights: payload.data,
      error: "",
    };
  } catch {
    return {
      highlights: null,
      error: "Nao foi possivel carregar os destaques salvos.",
    };
  }
}

function requestHighlights(abbrev: string, chapterNumber: number) {
  const highlightsKey = buildBibleTextHighlightsCacheKey(abbrev, chapterNumber);
  const cachedHighlights = readSharedHighlights(highlightsKey);

  if (cachedHighlights) {
    return Promise.resolve({
      highlights: cachedHighlights,
      error: "",
    } satisfies HighlightsRequestResult);
  }

  const pendingRequest = sharedHighlightsRequests.get(highlightsKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = fetchBibleTextHighlightsRequest(abbrev, chapterNumber)
    .then((result) => {
      if (result.highlights) {
        writeSharedHighlights(highlightsKey, result.highlights);
      }

      return result;
    })
    .finally(() => {
      sharedHighlightsRequests.delete(highlightsKey);
    });

  sharedHighlightsRequests.set(highlightsKey, request);
  return request;
}

function requestAllHighlights() {
  const cachedHighlights = readSharedAllHighlights();

  if (cachedHighlights) {
    return Promise.resolve({
      highlights: cachedHighlights,
      error: "",
    } satisfies HighlightsRequestResult);
  }

  if (sharedAllHighlightsRequest) {
    return sharedAllHighlightsRequest;
  }

  sharedAllHighlightsRequest = fetchBibleTextAllHighlightsRequest()
    .then((result) => {
      if (result.highlights) {
        writeSharedAllHighlights(result.highlights);
      }

      return result;
    })
    .finally(() => {
      sharedAllHighlightsRequest = null;
    });

  return sharedAllHighlightsRequest;
}

function resolveActiveVerse(
  chapter: BibleTextChapter,
  preferredVerseNumber?: number | null,
) {
  if (
    preferredVerseNumber &&
    chapter.verses.some((verse) => verse.number === preferredVerseNumber)
  ) {
    return preferredVerseNumber;
  }

  return chapter.verses[0]?.number ?? null;
}

function sameReadingPosition(
  first:
    | {
        abbrev: string;
        chapter: number;
        verse: number;
      }
    | null,
  second:
    | {
        abbrev: string;
        chapter: number;
        verse: number;
      }
    | null,
) {
  if (!first && !second) {
    return true;
  }

  if (!first || !second) {
    return false;
  }

  return (
    first.abbrev === second.abbrev &&
    first.chapter === second.chapter &&
    first.verse === second.verse
  );
}

function sortHighlights(first: BibleTextHighlight, second: BibleTextHighlight) {
  if (first.order !== second.order) {
    return first.order - second.order;
  }

  if (first.chapter !== second.chapter) {
    return first.chapter - second.chapter;
  }

  return first.verse - second.verse;
}

function mergeHighlight(
  items: BibleTextHighlight[],
  highlight: BibleTextHighlight,
) {
  return [
    ...items.filter(
      (item) =>
        !(
          item.abbrev === highlight.abbrev &&
          item.chapter === highlight.chapter &&
          item.verse === highlight.verse
        ),
    ),
    highlight,
  ].sort(sortHighlights);
}

function removeHighlight(
  items: BibleTextHighlight[],
  abbrev: string,
  chapter: number,
  verse: number,
) {
  return items.filter(
    (item) =>
      !(item.abbrev === abbrev && item.chapter === chapter && item.verse === verse),
  );
}

function removeChapterHighlights(
  items: BibleTextHighlight[],
  abbrev: string,
  chapter: number,
) {
  return items.filter(
    (item) => !(item.abbrev === abbrev && item.chapter === chapter),
  );
}

interface SelectChapterOptions {
  preferredVerseNumber?: number | null;
}

export function useBibleTextSelection(
  initialBooks: BibleTextBook[],
  initialReadingState?: BibleTextReadingState | null,
  requestConfirmation?: (options: ConfirmationModalRequest) => Promise<boolean>,
) {
  if (initialReadingState && !sharedReadingStateCache) {
    sharedReadingStateCache = initialReadingState;
  }

  const seededReadingState = sharedReadingStateCache ?? initialReadingState ?? DEFAULT_READING_STATE;
  const latestRequestedChapterKeyRef = useRef("");
  const latestRequestedHighlightsKeyRef = useRef("");

  const [expandedBook, setExpandedBook] = useState<BibleTextBook | null>(null);
  const [selectedBook, setSelectedBook] = useState<BibleTextBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<BibleTextChapter | null>(null);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number | null>(null);
  const [activeVerseNumber, setActiveVerseNumber] = useState<number | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [loadingChapterKey, setLoadingChapterKey] = useState("");
  const [chapterError, setChapterError] = useState("");
  const [readingStateLoading, setReadingStateLoading] = useState(!sharedReadingStateCache && !initialReadingState);
  const [readingStateError, setReadingStateError] = useState("");
  const [fontScale, setFontScale] = useState(clampBibleTextFontScale(seededReadingState.fontScale));
  const [savedFontScale, setSavedFontScale] = useState(
    clampBibleTextFontScale(seededReadingState.fontScale),
  );
  const [fontSaving, setFontSaving] = useState(false);
  const [lastRead, setLastRead] = useState(seededReadingState.lastRead);
  const [bookmarkSaving, setBookmarkSaving] = useState(false);
  const [chapterHighlights, setChapterHighlights] = useState<BibleTextHighlight[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [highlightsError, setHighlightsError] = useState("");
  const [highlightPendingVerse, setHighlightPendingVerse] = useState<number | null>(null);
  const [allHighlights, setAllHighlights] = useState<BibleTextHighlight[]>(
    readSharedAllHighlights() ?? [],
  );
  const [allHighlightsLoading, setAllHighlightsLoading] = useState(false);
  const [allHighlightsError, setAllHighlightsError] = useState("");
  const [showingAllHighlights, setShowingAllHighlights] = useState(false);

  const currentReadingPosition =
    selectedBook && selectedChapter && activeVerseNumber
      ? {
          abbrev: selectedBook.abbrev,
          chapter: selectedChapter.chapter,
          verse: activeVerseNumber,
        }
      : null;
  const hasPendingBookmark = !sameReadingPosition(currentReadingPosition, lastRead);
  const canDecreaseFont = fontScale > 0.85;
  const canIncreaseFont = fontScale < 1.6;

  useEffect(() => {
    let active = true;

    if (sharedReadingStateCache) {
      setReadingStateLoading(false);
      setFontScale(clampBibleTextFontScale(sharedReadingStateCache.fontScale));
      setSavedFontScale(clampBibleTextFontScale(sharedReadingStateCache.fontScale));
      setLastRead(sharedReadingStateCache.lastRead);
      return undefined;
    }

    setReadingStateLoading(true);

    void requestReadingState().then((result) => {
      if (!active) {
        return;
      }

      if (result.state) {
        setFontScale(clampBibleTextFontScale(result.state.fontScale));
        setSavedFontScale(clampBibleTextFontScale(result.state.fontScale));
        setLastRead(result.state.lastRead);
        setReadingStateError("");
      } else if (result.error) {
        setReadingStateError(result.error);
      }

      setReadingStateLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (readingStateLoading || fontScale === savedFontScale) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFontSaving(true);

      void patchReadingState({
        fontScale,
      }).then((result) => {
        if (result.state) {
          const nextFontScale = clampBibleTextFontScale(result.state.fontScale);
          setSavedFontScale(nextFontScale);
          setFontScale(nextFontScale);
          setLastRead(result.state.lastRead);
          setReadingStateError("");
        } else if (result.error) {
          setReadingStateError(result.error);
        }

        setFontSaving(false);
      });
    }, FONT_SCALE_SAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [fontScale, readingStateLoading, savedFontScale]);

  async function loadHighlightsForChapter(abbrev: string, chapterNumber: number) {
    const highlightsKey = buildBibleTextHighlightsCacheKey(abbrev, chapterNumber);
    const cachedHighlights = readSharedHighlights(highlightsKey);

    latestRequestedHighlightsKeyRef.current = highlightsKey;
    setHighlightsError("");

    if (cachedHighlights) {
      setChapterHighlights(cachedHighlights);
      setHighlightsLoading(false);
      return;
    }

    setHighlightsLoading(true);
    const result = await requestHighlights(abbrev, chapterNumber);

    if (latestRequestedHighlightsKeyRef.current === highlightsKey) {
      if (result.highlights) {
        setChapterHighlights(result.highlights);
        if (sharedAllHighlightsCache) {
          writeSharedAllHighlights([
            ...removeChapterHighlights(sharedAllHighlightsCache, abbrev, chapterNumber),
            ...result.highlights,
          ]);
          setAllHighlights(readSharedAllHighlights() ?? []);
        }
      } else {
        setChapterHighlights([]);
        setHighlightsError(result.error);
      }

      setHighlightsLoading(false);
    }
  }

  function clearSelection() {
    latestRequestedChapterKeyRef.current = "";
    latestRequestedHighlightsKeyRef.current = "";
    setExpandedBook(null);
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedChapterNumber(null);
    setActiveVerseNumber(null);
    setChapterHighlights([]);
    setChapterLoading(false);
    setLoadingChapterKey("");
    setChapterError("");
    setHighlightsLoading(false);
    setHighlightsError("");
    setHighlightPendingVerse(null);
    setShowingAllHighlights(false);
    setAllHighlightsError("");
  }

  function toggleBook(book: BibleTextBook) {
    latestRequestedChapterKeyRef.current = "";
    latestRequestedHighlightsKeyRef.current = "";
    setChapterError("");
    setHighlightsError("");
    setChapterLoading(false);
    setHighlightsLoading(false);
    setLoadingChapterKey("");
    setHighlightPendingVerse(null);
    setShowingAllHighlights(false);
    setAllHighlightsError("");
    setSelectedBook(book);

    setExpandedBook((current) => (
      current?.abbrev === book.abbrev ? null : book
    ));

    if (selectedChapter?.abbrev !== book.abbrev) {
      setSelectedChapter(null);
      setSelectedChapterNumber(null);
      setActiveVerseNumber(null);
      setChapterHighlights([]);
    }
  }

  async function selectChapter(
    book: BibleTextBook,
    chapterNumber: number,
    options: SelectChapterOptions = {},
  ) {
    const chapterKey = buildBibleTextChapterCacheKey(book.abbrev, chapterNumber);

    setExpandedBook(book);
    setSelectedBook(book);
    setSelectedChapterNumber(chapterNumber);
    setChapterError("");
    setHighlightsError("");
    setHighlightPendingVerse(null);
    setShowingAllHighlights(false);
    setAllHighlightsError("");

    const cachedChapter = readSharedChapter(chapterKey);

    if (cachedChapter) {
      latestRequestedChapterKeyRef.current = "";
      setChapterLoading(false);
      setLoadingChapterKey("");
      setSelectedChapter(cachedChapter);
      setActiveVerseNumber(resolveActiveVerse(cachedChapter, options.preferredVerseNumber));
      prefetchChapter(cachedChapter.abbrev, cachedChapter.previousChapter);
      prefetchChapter(cachedChapter.abbrev, cachedChapter.nextChapter);
      void loadHighlightsForChapter(cachedChapter.abbrev, cachedChapter.chapter);
      return;
    }

    latestRequestedChapterKeyRef.current = chapterKey;
    setChapterLoading(true);
    setLoadingChapterKey(chapterKey);
    setChapterHighlights([]);

    const result = await requestChapter(book.abbrev, chapterNumber);

    if (result.chapter) {
      prefetchChapter(result.chapter.abbrev, result.chapter.previousChapter);
      prefetchChapter(result.chapter.abbrev, result.chapter.nextChapter);
    }

    if (latestRequestedChapterKeyRef.current === chapterKey) {
      if (result.chapter) {
        setSelectedChapter(result.chapter);
        setActiveVerseNumber(resolveActiveVerse(result.chapter, options.preferredVerseNumber));
        void loadHighlightsForChapter(result.chapter.abbrev, result.chapter.chapter);
      } else {
        setChapterError(result.error);
      }

      latestRequestedChapterKeyRef.current = "";
      setChapterLoading(false);
      setLoadingChapterKey("");
    }
  }

  async function goToChapter(chapterNumber: number, options: SelectChapterOptions = {}) {
    if (!selectedBook) {
      return;
    }

    await selectChapter(selectedBook, chapterNumber, options);
  }

  function selectVerse(verseNumber: number) {
    setActiveVerseNumber(verseNumber);
  }

  function closeAllHighlights() {
    setShowingAllHighlights(false);
    setAllHighlightsError("");
  }

  async function openAllHighlights() {
    setShowingAllHighlights(true);
    setAllHighlightsError("");

    const cachedHighlights = readSharedAllHighlights();

    if (cachedHighlights) {
      setAllHighlights(cachedHighlights);
      setAllHighlightsLoading(false);
      return;
    }

    setAllHighlightsLoading(true);
    const result = await requestAllHighlights();

    if (result.highlights) {
      setAllHighlights(result.highlights);
      setAllHighlightsError("");
    } else {
      setAllHighlights([]);
      setAllHighlightsError(result.error);
    }

    setAllHighlightsLoading(false);
  }

  function adjustFontScale(direction: "increase" | "decrease") {
    setReadingStateError("");
    setFontScale((current) =>
      clampBibleTextFontScale(current + (direction === "increase" ? 0.1 : -0.1)),
    );
  }

  async function saveBookmark(verseNumber = activeVerseNumber) {
    if (!selectedBook || !selectedChapter || !verseNumber) {
      setReadingStateError("Selecione um versiculo antes de salvar o marcador.");
      return false;
    }

    setBookmarkSaving(true);
    setReadingStateError("");

    const result = await patchReadingState({
      lastRead: {
        abbrev: selectedBook.abbrev,
        chapter: selectedChapter.chapter,
        verse: verseNumber,
      },
    });

    setBookmarkSaving(false);

    if (!result.state) {
      setReadingStateError(result.error);
      return false;
    }

    setLastRead(result.state.lastRead);
    setSavedFontScale(clampBibleTextFontScale(result.state.fontScale));
    setFontScale(clampBibleTextFontScale(result.state.fontScale));
    setReadingStateError("");
    return true;
  }

  async function resumeLastRead() {
    if (!lastRead) {
      return;
    }

    const targetBook = initialBooks.find((item) => item.abbrev === lastRead.abbrev);

    if (!targetBook) {
      setReadingStateError("Nao foi possivel localizar o livro salvo no marcador.");
      return;
    }

    setExpandedBook(targetBook);
    await selectChapter(targetBook, lastRead.chapter, {
      preferredVerseNumber: lastRead.verse,
    });
  }

  async function openHighlight(highlight: BibleTextHighlight) {
    const targetBook = initialBooks.find((item) => item.abbrev === highlight.abbrev);

    if (!targetBook) {
      setAllHighlightsError("Nao foi possivel localizar o livro deste destaque.");
      return;
    }

    setExpandedBook(targetBook);
    setShowingAllHighlights(false);
    await selectChapter(targetBook, highlight.chapter, {
      preferredVerseNumber: highlight.verse,
    });
  }

  async function toggleHighlight(verseNumber: number) {
    if (!selectedChapter || !selectedBook) {
      return;
    }

    const existingHighlight = chapterHighlights.find((item) => item.verse === verseNumber);
    const highlightsKey = buildBibleTextHighlightsCacheKey(
      selectedBook.abbrev,
      selectedChapter.chapter,
    );

    setHighlightPendingVerse(verseNumber);
    setHighlightsError("");

    if (existingHighlight) {
      try {
        const response = await fetch(
          `/api/bible-text/me/highlights/books/${encodeURIComponent(selectedBook.abbrev)}/chapters/${selectedChapter.chapter}/verses/${verseNumber}`,
          {
            method: "DELETE",
          },
        );

        if (response.status !== 204) {
          const payload = (await response.json().catch(() => null)) as ApiEnvelope<null> | null;
          setHighlightsError(payload?.message ?? "Nao foi possivel remover o destaque.");
          return;
        }

        const nextHighlights = chapterHighlights.filter((item) => item.verse !== verseNumber);
        setChapterHighlights(nextHighlights);
        writeSharedHighlights(highlightsKey, nextHighlights);
        const nextAllHighlights = removeHighlight(
          allHighlights,
          selectedBook.abbrev,
          selectedChapter.chapter,
          verseNumber,
        );
        setAllHighlights(nextAllHighlights);

        if (sharedAllHighlightsCache) {
          writeSharedAllHighlights(nextAllHighlights);
        }
      } catch {
        setHighlightsError("Nao foi possivel remover o destaque.");
      } finally {
        setHighlightPendingVerse(null);
      }

      return;
    }

    try {
      const response = await fetch(
        `/api/bible-text/me/highlights/books/${encodeURIComponent(selectedBook.abbrev)}/chapters/${selectedChapter.chapter}/verses/${verseNumber}`,
        {
          method: "PUT",
        },
      );
      const payload = (await response.json()) as ApiEnvelope<BibleTextHighlight>;

      if (!response.ok || payload.status !== "success" || !payload.data) {
        setHighlightsError(payload.message ?? "Nao foi possivel destacar o versiculo.");
        return;
      }

      const nextHighlights = [...chapterHighlights, payload.data].sort(sortHighlights);
      setChapterHighlights(nextHighlights);
      writeSharedHighlights(highlightsKey, nextHighlights);
      const nextAllHighlights = mergeHighlight(allHighlights, payload.data);
      setAllHighlights(nextAllHighlights);

      if (sharedAllHighlightsCache) {
        writeSharedAllHighlights(nextAllHighlights);
      }
    } catch {
      setHighlightsError("Nao foi possivel destacar o versiculo.");
    } finally {
      setHighlightPendingVerse(null);
    }
  }

  async function confirmExitIfNeeded() {
    if (!hasPendingBookmark) {
      return true;
    }

    const bookmarkReference =
      selectedBook && selectedChapter && activeVerseNumber
        ? `${selectedBook.name} ${selectedChapter.chapter}:${activeVerseNumber}`
        : "este ponto da leitura";

    const shouldSave = requestConfirmation
      ? await requestConfirmation({
          title: "Adicionar marcador de pagina?",
          description: `Voce deseja salvar ${bookmarkReference} antes de sair da leitura?`,
          confirmLabel: "Salvar marcador",
          cancelLabel: "Sair sem salvar",
        })
      : true;

    if (!shouldSave) {
      return true;
    }

    const saved = await saveBookmark();

    if (saved) {
      return true;
    }

    return requestConfirmation
      ? await requestConfirmation({
          title: "Nao foi possivel salvar o marcador",
          description: "Deseja sair mesmo assim e perder esse ponto de retorno?",
          confirmLabel: "Sair mesmo assim",
          cancelLabel: "Continuar leitura",
          tone: "danger",
        })
      : false;
  }

  return {
    expandedBook,
    selectedBook,
    selectedChapter,
    selectedChapterNumber,
    activeVerseNumber,
    chapterLoading,
    loadingChapterKey,
    chapterError,
    readingStateLoading,
    readingStateError,
    fontScale,
    fontSaving,
    canDecreaseFont,
    canIncreaseFont,
    lastRead,
    bookmarkSaving,
    hasPendingBookmark,
    chapterHighlights,
    highlightsLoading,
    highlightsError,
    highlightPendingVerse,
    allHighlights,
    allHighlightsLoading,
    allHighlightsError,
    showingAllHighlights,
    toggleBook,
    selectChapter,
    goToChapter,
    selectVerse,
    toggleHighlight,
    closeAllHighlights,
    openAllHighlights,
    openHighlight,
    adjustFontScale,
    saveBookmark,
    resumeLastRead,
    confirmExitIfNeeded,
    clearSelection,
  };
}
