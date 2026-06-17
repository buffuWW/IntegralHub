import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { RandomTaskButton } from "@/components/tasks/RandomTaskButton";
import { LinkButton } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { buildOrderBy, buildPublicTaskWhere, getPagination } from "@/lib/task-query";

export const dynamic = "force-dynamic";

export default async function TasksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const resolved = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) if (typeof value === "string") params.set(key, value);
  const where = buildPublicTaskWhere(params);
  const { page, take, skip } = getPagination(params);
  const [tasks, total, categories] = await Promise.all([
    prisma.task.findMany({ where, skip, take, orderBy: buildOrderBy(params.get("sort")), include: { category: true } }),
    prisma.task.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } })
  ]);
  const pageCount = Math.max(1, Math.ceil(total / take));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Все задания</h1>
          <p className="mt-2 text-slate-600">Найдено заданий: {total}</p>
        </div>
        <RandomTaskButton query={params.toString()} label="Случайное по фильтрам" />
      </div>
      <TaskFilters categories={categories.map(({ slug, name }) => ({ slug, name }))} />
      {tasks.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center">По выбранным фильтрам заданий нет.</div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </div>
      )}
      <div className="mt-8 flex items-center justify-center gap-3">
        {page > 1 && <LinkButton href={`/tasks?${new URLSearchParams({ ...Object.fromEntries(params), page: String(page - 1) })}`} variant="secondary">Назад</LinkButton>}
        <span className="font-semibold">Страница {page} из {pageCount}</span>
        {page < pageCount && <LinkButton href={`/tasks?${new URLSearchParams({ ...Object.fromEntries(params), page: String(page + 1) })}`} variant="secondary">Вперёд</LinkButton>}
      </div>
    </main>
  );
}
