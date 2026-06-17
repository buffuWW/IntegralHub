import { TaskStatus } from "@prisma/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { purgeExpiredArchivedTasks } from "@/lib/archive";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function hoursLeft(date: Date | null) {
  if (!date) return "не задано";
  return `${Math.max(0, Math.ceil((date.getTime() - Date.now()) / 36e5))} ч`;
}

export default async function ArchivePage() {
  await purgeExpiredArchivedTasks();
  const tasks = await prisma.task.findMany({ where: { status: TaskStatus.ARCHIVED }, include: { category: true }, orderBy: { archivedAt: "desc" } });
  return (
    <AdminShell>
      <h1 className="mb-5 text-3xl font-black">Архив</h1>
      <div className="grid gap-3">
        {tasks.length === 0 && <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">Архив пуст.</div>}
        {tasks.map((task) => (
          <article key={task.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold">Задание №{task.number}</h2>
            <p>{task.category.name}</p>
            <p>Архивировано: {task.archivedAt?.toLocaleString("ru-RU")}</p>
            <p>Окончательное удаление: {task.purgeAt?.toLocaleString("ru-RU")} ({hoursLeft(task.purgeAt)})</p>
            <div className="mt-3 flex gap-3">
              <form action={async () => { "use server"; const { setTaskStatus } = await import("@/lib/task-service"); const { TaskStatus } = await import("@prisma/client"); await setTaskStatus(task.id, TaskStatus.HIDDEN); }}>
                <Button>Восстановить</Button>
              </form>
              <form action={async () => { "use server"; const { purgeTask } = await import("@/lib/task-service"); await purgeTask(task.id); }}>
                <Button variant="danger">Удалить окончательно</Button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
