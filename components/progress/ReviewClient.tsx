"use client";

import { Shuffle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TaskCard, type TaskCardData } from "@/components/tasks/TaskCard";
import { TaskDetailClient } from "@/components/tasks/TaskDetailClient";
import { Button, LinkButton } from "@/components/ui/Button";
import { loadProgress, setTaskStatus, type ProgressState } from "@/lib/progress";
import type { Difficulty, TaskImage } from "@prisma/client";

type ReviewTask = TaskCardData & {
  answerMarkdown: string;
  solutionMarkdown: string;
  images: TaskImage[];
};

type ApiTasks = { success: true; data: { tasks: ReviewTask[] } };

export function ReviewClient({ categories }: { categories: Array<{ slug: string; name: string }> }) {
  const [progress, setProgress] = useState<ProgressState>({ version: 1, tasks: {} });
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [session, setSession] = useState<ReviewTask[]>([]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((me: { data: { authenticated: boolean } }) => {
      if (me.data.authenticated) {
        return fetch("/api/progress?status=REVIEW&limit=100").then((r) => r.json()).then((json: { data: { items: Array<{ status: string; task: ReviewTask }> } }) => {
          const nextProgress: ProgressState = { version: 1, tasks: {} };
          setTasks(json.data.items.map((item) => {
            nextProgress.tasks[String(item.task.number)] = {
              status: "REVIEW",
              firstViewedAt: new Date().toISOString(),
              lastViewedAt: new Date().toISOString(),
              viewCount: 1,
              answerOpened: false,
              solutionOpened: false
            };
            return item.task;
          }));
          setProgress(nextProgress);
        });
      }
      setProgress(loadProgress());
      return fetch("/api/tasks?sort=number-asc").then((r) => r.json()).then((json: ApiTasks) => setTasks(json.data.tasks));
    });
  }, []);

  const reviewTasks = useMemo(() => {
    return tasks.filter((task) => {
      const isReview = progress.tasks[String(task.number)]?.status === "REVIEW";
      const categoryOk = !category || task.category.slug === category;
      const difficultyOk = !difficulty || task.difficulty === difficulty;
      return isReview && categoryOk && difficultyOk;
    });
  }, [tasks, progress, category, difficulty]);

  function startSession() {
    setSession([...reviewTasks].sort(() => Math.random() - 0.5));
  }

  function markSolved(number: number) {
    setTaskStatus(number, "SOLVED");
    const task = tasks.find((item) => item.number === number);
    if (task?.id) void fetch(`/api/progress/${task.id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "SOLVED" }) });
    setProgress(loadProgress());
    setSession((items) => items.filter((item) => item.number !== number));
  }

  if (session.length > 0) {
    const current = session[0];
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="mb-4 font-semibold text-indigo-700">Осталось заданий: {session.length}</p>
        <TaskCard task={current} userStatus="REVIEW" />
        <TaskDetailClient number={current.number} taskId={current.id ?? ""} answerMarkdown={current.answerMarkdown} solutionMarkdown={current.solutionMarkdown} images={current.images} />
        <div className="mt-4 flex gap-3">
          <Button onClick={() => markSolved(current.number)}>Решил правильно</Button>
          <Button variant="secondary" onClick={() => setSession((items) => [...items.slice(1), current])}>Оставить на повторение</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Повторение</h1>
      <p className="mt-2 text-slate-600">Здесь собраны задания, которые вы отметили как требующие повторения.</p>
      <div className="my-5 flex flex-wrap gap-3">
        <select className="focus-ring rounded-md border border-slate-300 px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Все категории</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select className="focus-ring rounded-md border border-slate-300 px-3 py-2" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}>
          <option value="">Все сложности</option>
          <option value="EASY">Лёгкий</option>
          <option value="MEDIUM">Средний</option>
          <option value="HARD">Сложный</option>
        </select>
        <Button onClick={startSession} disabled={reviewTasks.length === 0}><Shuffle size={18} />Начать повторение</Button>
      </div>
      <p className="mb-4 font-semibold">Заданий для повторения: {reviewTasks.length}</p>
      {reviewTasks.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">Нет заданий для повторения.</div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviewTasks.map((task) => <TaskCard key={task.number} task={task} userStatus="REVIEW" />)}
        </div>
      )}
      <div className="mt-6"><LinkButton href="/tasks" variant="secondary">Вернуться в каталог</LinkButton></div>
    </main>
  );
}
