import type { Category, Difficulty } from "@prisma/client";
import { DifficultyBadge, UserStatusBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Formula } from "@/components/math/Formula";

export type TaskCardData = {
  number: number;
  difficulty: Difficulty;
  conditionMarkdown: string;
  expressionLatex: string;
  category: Category;
};

export function TaskCard({ task, userStatus }: { task: TaskCardData; userStatus?: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-bold text-slate-900">Задание №{task.number}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm text-slate-700">{task.category.name}</span>
        <DifficultyBadge value={task.difficulty} />
        <UserStatusBadge value={userStatus} />
      </div>
      <p className="mb-4 line-clamp-3 text-slate-700">{task.conditionMarkdown}</p>
      <Formula latex={task.expressionLatex} />
      <div className="mt-4">
        <LinkButton href={`/tasks/${task.number}`} variant="secondary">Открыть задание</LinkButton>
      </div>
    </article>
  );
}
