import { Difficulty, TaskStatus } from "@prisma/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { LinkButton } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [total, published, hidden, archived, categories, easy, medium, hard, latest, imports] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: TaskStatus.PUBLISHED } }),
    prisma.task.count({ where: { status: TaskStatus.HIDDEN } }),
    prisma.task.count({ where: { status: TaskStatus.ARCHIVED } }),
    prisma.category.count(),
    prisma.task.count({ where: { difficulty: Difficulty.EASY } }),
    prisma.task.count({ where: { difficulty: Difficulty.MEDIUM } }),
    prisma.task.count({ where: { difficulty: Difficulty.HARD } }),
    prisma.task.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { category: true } }),
    prisma.importBatch.findMany({ take: 5, orderBy: { createdAt: "desc" } })
  ]);
  return (
    <AdminShell>
      <h1 className="mb-5 text-3xl font-black">Административная панель</h1>
      <div className="grid gap-3 md:grid-cols-4">
        {[["Всего", total], ["Опубликовано", published], ["Скрыто", hidden], ["В архиве", archived], ["Категорий", categories], ["Лёгких", easy], ["Средних", medium], ["Сложных", hard]].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-2xl font-black text-indigo-700">{value}</p><p>{label}</p></div>
        ))}
      </div>
      <div className="my-6 flex flex-wrap gap-3">
        <LinkButton href="/admin/tasks/new">Добавить задание</LinkButton>
        <LinkButton href="/admin/import" variant="secondary">Импортировать CSV/ZIP</LinkButton>
        <LinkButton href="/admin/tasks" variant="secondary">Управление заданиями</LinkButton>
        <LinkButton href="/admin/archive" variant="secondary">Открыть архив</LinkButton>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-xl font-bold">Последние задания</h2>
          {latest.map((task) => <p key={task.id} className="border-t border-slate-100 py-2">№{task.number} — {task.category.name}</p>)}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-xl font-bold">Последние импорты</h2>
          {imports.length === 0 ? <p>Импортов пока нет.</p> : imports.map((item) => <p key={item.id} className="border-t border-slate-100 py-2">{item.originalFileName} — {item.status}</p>)}
        </div>
      </section>
    </AdminShell>
  );
}
