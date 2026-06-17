import { TaskStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { Formula } from "@/components/math/Formula";
import { SafeMarkdown } from "@/components/math/SafeMarkdown";
import { RandomTaskButton } from "@/components/tasks/RandomTaskButton";
import { TaskDetailClient } from "@/components/tasks/TaskDetailClient";
import { DifficultyBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TaskPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const taskNumber = Number(number);
  const task = await prisma.task.findFirst({ where: { number: taskNumber, status: TaskStatus.PUBLISHED }, include: { category: true, images: true } });
  if (!task) notFound();
  const [previous, next] = await Promise.all([
    prisma.task.findFirst({ where: { status: TaskStatus.PUBLISHED, number: { lt: task.number } }, orderBy: { number: "desc" }, select: { number: true } }),
    prisma.task.findFirst({ where: { status: TaskStatus.PUBLISHED, number: { gt: task.number } }, orderBy: { number: "asc" }, select: { number: true } })
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-2xl font-black">Задание №{task.number}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">{task.category.name}</span>
        <DifficultyBadge value={task.difficulty} />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SafeMarkdown content={task.conditionMarkdown} />
        <div className="mt-5"><Formula latex={task.expressionLatex} /></div>
        {task.source && <p className="mt-4 text-sm text-slate-500">Источник: {task.source}</p>}
      </section>
      <TaskDetailClient number={task.number} taskId={task.id} answerMarkdown={task.answerMarkdown} solutionMarkdown={task.solutionMarkdown} images={task.images} />
      <div className="mt-8 flex flex-wrap justify-between gap-3">
        {previous ? <LinkButton href={`/tasks/${previous.number}`} variant="secondary">Предыдущее</LinkButton> : <span />}
        <RandomTaskButton label="Случайное" />
        {next ? <LinkButton href={`/tasks/${next.number}`} variant="secondary">Следующее</LinkButton> : <span />}
      </div>
    </main>
  );
}
