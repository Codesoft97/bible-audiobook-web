export interface BibleReferenceGroup {
  book: string;
  passages: string[];
}

const BOOK_REFERENCE_PATTERN =
  /^((?:\d+\s+)?[\p{L}\p{M}][\p{L}\p{M}.'-]*(?:\s+[\p{L}\p{M}][\p{L}\p{M}.'-]*)*)\s+(\d.*)$/u;

function normalizeReferenceSegment(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function parseBibleReferenceGroups(references?: string | null) {
  if (!references) {
    return [] as BibleReferenceGroup[];
  }

  const segments = references
    .split(";")
    .map(normalizeReferenceSegment)
    .filter(Boolean);

  const groups: BibleReferenceGroup[] = [];
  let currentGroup: BibleReferenceGroup | null = null;

  for (const segment of segments) {
    const match = BOOK_REFERENCE_PATTERN.exec(segment);
    const book = match?.[1];
    const passage = match?.[2];

    if (book && passage) {
      currentGroup = {
        book,
        passages: [passage],
      };
      groups.push(currentGroup);
      continue;
    }

    if (!currentGroup) {
      currentGroup = {
        book: "Referencia",
        passages: [segment],
      };
      groups.push(currentGroup);
      continue;
    }

    currentGroup.passages.push(segment);
  }

  return groups;
}

export function countBibleReferencePassages(groups: BibleReferenceGroup[]) {
  return groups.reduce((total, group) => total + group.passages.length, 0);
}
