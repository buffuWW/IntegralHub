import { Difficulty } from "@prisma/client";
import { TaskCard } from "@/components/tasks/TaskCard";
import { LinkButton } from "@/components/ui/Button";
import { difficultyLabels } from "@/lib/constants";
import { requireUserPage } from "@/lib/user-auth";
import { getProgressStats } from "@/lib/user-progress-service";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await requireUserPage("/progress");
  const stats = await getProgressStats(user.id);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Мой прогресс</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {[
          ["Просмотрено", stats.viewedCount],
          ["Решено", stats.solvedCount],
          ["Повторить", stats.reviewCount],
          ["Открыто решений", stats.solutionsOpened],
          ["Прогресс", `${stats.solvedPercent}%`]
        ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-2xl font-black text-indigo-700">{value}</p><p className="text-sm text-slate-600">{label}</p></div>)}
      </div>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-xl font-bold">По категориям</h2>
          {stats.byCategory.map((item) => <p key={item.id} className="border-t border-slate-100 py-2">{item.name}: {item.solved} из {item.total}</p>)}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-xl font-bold">По сложности</h2>
          {Object.values(Difficulty).map((difficulty) => <p key={difficulty} className="border-t border-slate-100 py-2">{difficultyLabels[difficulty]}: {stats.latestSolved.filter((p) => p.task.difficulty === difficulty).length}</p>)}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Последние просмотренные</h2>
        {stats.latest.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white p-8">Пока нет просмотренных заданий.</div> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{stats.latest.map((item) => <TaskCard key={item.id} task={item.task} userStatus={item.status} />)}</div>
        )}
      </section>
      <div className="mt-8 flex gap-3">
        <LinkButton href="/tasks">Продолжить решать</LinkButton>
        <LinkButton href="/review" variant="secondary">Начать повторение</LinkButton>
      </div>
    </main>
  );
}
