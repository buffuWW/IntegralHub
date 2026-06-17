"use client";

import type { TaskImage } from "@prisma/client";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { SafeMarkdown } from "@/components/math/SafeMarkdown";
import { Button } from "@/components/ui/Button";
import { getTaskProgress, markAnswerOpened, markSolutionOpened, markViewed, setTaskStatus } from "@/lib/progress";

export function TaskDetailClient({
  number,
  taskId,
  answerMarkdown,
  solutionMarkdown,
  images
}: {
  number: number;
  taskId: string;
  answerMarkdown: string;
  solutionMarkdown: string;
  images: TaskImage[];
}) {
  const [answerOpen, setAnswerOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [status, setStatus] = useState<string>("UNSEEN");
  const [message, setMessage] = useState("");

  useEffect(() => {
    markViewed(number);
    setStatus(getTaskProgress(number)?.status ?? "VIEWED");
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json: { data?: { authenticated: boolean } }) => {
        if (json.data?.authenticated) {
          return fetch(`/api/progress/${taskId}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ incrementViewCount: true })
          });
        }
        return null;
      })
      .catch(() => undefined);
  }, [number, taskId]);

  async function syncServer(payload: Record<string, unknown>) {
    await fetch(`/api/progress/${taskId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => undefined);
  }

  function choose(next: "SOLVED" | "REVIEW") {
    setTaskStatus(number, next);
    setStatus(next);
    void syncServer({ status: next });
    setMessage(next === "SOLVED" ? "Отмечено как решённое правильно" : "Задание добавлено в повторение");
  }

  return (
    <section className="mt-6 space-y-5" aria-live="polite">
      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((image) => (
            <img key={image.id} src={`/api/uploads/${image.storagePath}`} alt={image.altText ?? image.originalFileName} className="max-h-72 rounded-lg border border-slate-200 bg-white object-contain p-2" />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          aria-expanded={answerOpen}
          onClick={() => {
            const next = !answerOpen;
            setAnswerOpen(next);
            if (next) {
              markAnswerOpened(number);
              void syncServer({ answerOpened: true });
            }
          }}
        >
          {answerOpen ? "Скрыть ответ" : "Показать ответ"}
        </Button>
        <Button
          variant="secondary"
          aria-expanded={solutionOpen}
          onClick={() => {
            const next = !solutionOpen;
            setSolutionOpen(next);
            if (next) {
              markSolutionOpened(number);
              void syncServer({ solutionOpened: true });
            }
          }}
        >
          {solutionOpen ? "Скрыть решение" : "Показать решение"}
        </Button>
      </div>
      {answerOpen && <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-5"><h2 className="mb-3 text-xl font-bold">Краткий ответ</h2><SafeMarkdown content={answerMarkdown} /></div>}
      {solutionOpen && <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-3 text-xl font-bold">Подробное решение</h2><SafeMarkdown content={solutionMarkdown} /></div>}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="mb-3 font-semibold">Ваш статус: {status === "SOLVED" ? "Решено правильно" : status === "REVIEW" ? "Нужно повторить" : "Просмотрено"}</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => choose("SOLVED")}><CheckCircle2 size={18} />Решил правильно</Button>
          <Button variant="secondary" onClick={() => choose("REVIEW")}><RotateCcw size={18} />Нужно повторить</Button>
        </div>
        {message && <p className="mt-3 text-sm font-semibold text-indigo-700">{message}</p>}
      </div>
    </section>
  );
}
