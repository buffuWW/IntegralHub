"use client";

import { useEffect, useMemo, useState } from "react";
import { TaskCard, type TaskCardData } from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/Button";
import { clearHistoryOnly, loadProgress, resetProgress, type ProgressState } from "@/lib/progress";

type ApiTasks = { success: true; data: { tasks: TaskCardData[] } };

export function HistoryClient() {
  const [progress, setProgress] = useState<ProgressState>({ version: 1, tasks: {} });
  const [tasks, setTasks] = useState<TaskCardData[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    setProgress(loadProgress());
    fetch("/api/tasks?sort=number-asc").then((r) => r.json()).then((json: ApiTasks) => setTasks(json.data.tasks));
  }, []);

  const rows = useMemo(() => {
    return tasks
      .filter((task) => progress.tasks[String(task.number)])
      .filter((task) => filter === "ALL" || progress.tasks[String(task.number)]?.status === filter)
      .sort((a, b) => String(progress.tasks[String(b.number)]?.lastViewedAt).localeCompare(String(progress.tasks[String(a.number)]?.lastViewedAt)));
  }, [tasks, progress, filter]);

  function refresh() {
    setProgress(loadProgress());
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">История</h1>
      <p className="mt-2 text-slate-600">История хранится только в этом браузере и не синхронизируется между устройствами.</p>
      <div className="my-5 flex flex-wrap gap-3">
        {[
          ["ALL", "Все"],
          ["SOLVED", "Решено правильно"],
          ["REVIEW", "Нужно повторить"],
          ["VIEWED", "Без оценки"]
        ].map(([value, label]) => <Button key={value} variant={filter === value ? "primary" : "secondary"} onClick={() => setFilter(value)}>{label}</Button>)}
        <Button variant="secondary" onClick={() => { if (confirm("Очистить историю просмотров? Статусы сохранятся.")) { clearHistoryOnly(); refresh(); } }}>Очистить историю просмотров</Button>
        <Button variant="danger" onClick={() => { if (confirm("Сбросить весь прогресс без восстановления?")) { resetProgress(); refresh(); } }}>Сбросить весь прогресс</Button>
      </div>
      {rows.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">История пока пуста.</div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((task) => {
            const item = progress.tasks[String(task.number)];
            return (
              <div key={task.number}>
                <TaskCard task={task} userStatus={item?.status} />
                <div className="rounded-b-lg border-x border-b border-slate-200 bg-white px-5 pb-4 text-sm text-slate-600">
                  <p>Последний просмотр: {item ? new Date(item.lastViewedAt).toLocaleString("ru-RU") : ""}</p>
                  <p>Ответ открывался: {item?.answerOpened ? "да" : "нет"}</p>
                  <p>Решение открывалось: {item?.solutionOpened ? "да" : "нет"}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
