import { Difficulty } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { DifficultyBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { RandomTaskButton } from "@/components/tasks/RandomTaskButton";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, stats] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { tasks: { where: { status: TaskStatus.PUBLISHED } } } } }
    }),
    Promise.all([
      prisma.task.count({ where: { status: TaskStatus.PUBLISHED } }),
      prisma.category.count(),
      prisma.task.count({ where: { status: TaskStatus.PUBLISHED, difficulty: Difficulty.EASY } }),
      prisma.task.count({ where: { status: TaskStatus.PUBLISHED, difficulty: Difficulty.MEDIUM } }),
      prisma.task.count({ where: { status: TaskStatus.PUBLISHED, difficulty: Difficulty.HARD } })
    ])
  ]);
  const [total, categoryCount, easy, medium, hard] = stats;

  return (
    <main>
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <p className="mb-3 font-semibold text-indigo-700">Самостоятельная практика интегралов</p>
          <h1 className="max-w-3xl text-4xl font-black tracking-normal text-slate-950 md:text-6xl">Integral Hub</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-700">Решайте интегралы самостоятельно, проверяйте ответы и возвращайтесь к заданиям, которые требуют повторения.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/tasks"><ArrowRight size={18} />Начать решать</LinkButton>
            <RandomTaskButton />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">Категории</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <article key={category.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold">{category.name}</h3>
              <p className="mt-2 min-h-12 text-slate-600">{category.description}</p>
              <p className="mt-3 text-sm font-semibold text-slate-700">Опубликовано: {category._count.tasks}</p>
              <div className="mt-4"><LinkButton href={`/tasks?category=${category.slug}`} variant="secondary">Перейти</LinkButton></div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold">Уровни сложности</h2>
            <div className="flex flex-col gap-3">
              <p><DifficultyBadge value={Difficulty.EASY} /> <span className="ml-2">Базовые формулы и прямое интегрирование.</span></p>
              <p><DifficultyBadge value={Difficulty.MEDIUM} /> <span className="ml-2">Замены, области и несколько шагов.</span></p>
              <p><DifficultyBadge value={Difficulty.HARD} /> <span className="ml-2">Несобственные, многомерные и параметрические задачи.</span></p>
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">Статистика базы</h2>
            <div className="grid grid-cols-2 gap-3">
              {[["Заданий", total], ["Категорий", categoryCount], ["Лёгких", easy], ["Средних", medium], ["Сложных", hard]].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-2xl font-black text-indigo-700">{value}</p><p className="text-sm text-slate-600">{label}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">Как заниматься</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {["Выберите задание.", "Решите его самостоятельно.", "Проверьте ответ и отметьте результат."].map((text, index) => (
            <div key={text} className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-3xl font-black text-indigo-600">{index + 1}</p><p className="mt-3 text-slate-700">{text}</p></div>
          ))}
        </div>
      </section>
    </main>
  );
}
