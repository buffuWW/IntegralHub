import type { Difficulty, TaskStatus } from "@prisma/client";
import { difficultyLabels, statusLabels } from "@/lib/constants";

export function DifficultyBadge({ value }: { value: Difficulty }) {
  const classes = {
    EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MEDIUM: "bg-orange-50 text-orange-700 border-orange-200",
    HARD: "bg-rose-50 text-rose-700 border-rose-200"
  };
  return <span className={`rounded-full border px-2.5 py-1 text-sm font-semibold ${classes[value]}`}>{difficultyLabels[value]}</span>;
}

export function StatusBadge({ value }: { value: TaskStatus }) {
  const classes = {
    PUBLISHED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    HIDDEN: "bg-slate-100 text-slate-700 border-slate-200",
    ARCHIVED: "bg-amber-50 text-amber-700 border-amber-200"
  };
  return <span className={`rounded-full border px-2.5 py-1 text-sm font-semibold ${classes[value]}`}>{statusLabels[value]}</span>;
}

export function UserStatusBadge({ value }: { value?: string }) {
  const labels: Record<string, string> = {
    UNSEEN: "Не открывалось",
    VIEWED: "Просмотрено",
    SOLVED: "Решено правильно",
    REVIEW: "Нужно повторить"
  };
  return <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-sm text-slate-700">{labels[value ?? "UNSEEN"]}</span>;
}
