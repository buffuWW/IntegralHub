import type { Difficulty, TaskStatus } from "@prisma/client";

export const difficultyLabels: Record<Difficulty, string> = {
  EASY: "Лёгкий",
  MEDIUM: "Средний",
  HARD: "Сложный"
};

export const statusLabels: Record<TaskStatus, string> = {
  PUBLISHED: "Опубликовано",
  HIDDEN: "Скрыто",
  ARCHIVED: "В архиве"
};

export const difficultyOrder: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3
};

export const pageSize = 12;
