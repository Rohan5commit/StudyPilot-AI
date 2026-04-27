export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }

  return copy;
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function formatLongDate(value?: string | null) {
  if (!value) return "No exam date set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Flexible schedule";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function daysUntil(value?: string | null) {
  if (!value) return null;

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const utcToday = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());

  return Math.max(0, Math.ceil((utcTarget - utcToday) / (1000 * 60 * 60 * 24)));
}

export function percentage(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
