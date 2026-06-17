import { TaskStatus } from "@prisma/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTaskActions } from "@/components/admin/AdminTaskActions";
import { DifficultyBadge, StatusBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" && params.status in TaskStatus ? params.status as TaskStatus : undefined;
  const tasks = await prisma.task.findMany({
    where: {
      status,
      OR: q ? [
        { conditionMarkdown: { contains: q, mode: "insensitive" } },
        { expressionLatex: { contains: q, mode: "insensitive" } },
        Number.isInteger(Number(q)) ? { number: Number(q) } : {}
      ] : undefined
    },
    include: { category: true },
    orderBy: { number: "asc" }
  });
  return (
    <AdminShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black">Задания</h1>
        <LinkButton href="/admin/tasks/new">Добавить задание</LinkButton>
      </div>
      <form className="mb-4 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Поиск" className="focus-ring rounded-md border border-slate-300 px-3 py-2" />
        <select name="status" defaultValue={status ?? ""} className="focus-ring rounded-md border border-slate-300 px-3 py-2">
          <option value="">Все состояния</option>
          <option value="PUBLISHED">Опубликовано</option>
          <option value="HIDDEN">Скрыто</option>
          <option value="ARCHIVED">Архив</option>
        </select>
        <button className="focus-ring rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white">Найти</button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-slate-50"><tr>{["№", "Категория", "Сложность", "Условие", "Состояние", "Обновлено", "Действия"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t border-slate-100">
                <td className="p-3 font-bold">{task.number}</td>
                <td className="p-3">{task.category.name}</td>
                <td className="p-3"><DifficultyBadge value={task.difficulty} /></td>
                <td className="max-w-sm p-3">{task.conditionMarkdown}</td>
                <td className="p-3"><StatusBadge value={task.status} /></td>
                <td className="p-3">{task.updatedAt.toLocaleDateString("ru-RU")}</td>
                <td className="p-3"><AdminTaskActions id={task.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-slate-600">Для массовых операций используйте API; интерфейс таблицы оставлен компактным и поддерживает фильтры.</p>
    </AdminShell>
  );
}
