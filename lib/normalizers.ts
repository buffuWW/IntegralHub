import { Difficulty, TaskStatus } from "@prisma/client";

export function normalizeDifficulty(value: string): Difficulty | null {
  const normalized = value.trim().toLowerCase();
  if (["easy", "лёгкий", "легкий"].includes(normalized)) return Difficulty.EASY;
  if (["medium", "средний"].includes(normalized)) return Difficulty.MEDIUM;
  if (["hard", "сложный"].includes(normalized)) return Difficulty.HARD;
  return null;
}

export function normalizePublished(value: string | undefined | null): TaskStatus | null {
  if (value === undefined || value === null || value.trim() === "") return TaskStatus.HIDDEN;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "да"].includes(normalized)) return TaskStatus.PUBLISHED;
  if (["false", "0", "no", "нет"].includes(normalized)) return TaskStatus.HIDDEN;
  return null;
}

export function parsePositiveInt(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[а-я]/g, (char) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z",
        и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
        р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch",
        ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
      };
      return map[char] ?? char;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
