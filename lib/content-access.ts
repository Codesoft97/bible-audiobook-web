export function canConsumeContent(isFree: boolean, hasPremiumAccess: boolean) {
  return isFree || hasPremiumAccess;
}

export function hasConsumableContent<T extends { isFree: boolean }>(
  items: T[],
  hasPremiumAccess: boolean,
) {
  return items.some((item) => canConsumeContent(item.isFree, hasPremiumAccess));
}

export function filterConsumableContent<T extends { isFree: boolean }>(
  items: T[],
  hasPremiumAccess: boolean,
) {
  return items.filter((item) => canConsumeContent(item.isFree, hasPremiumAccess));
}
