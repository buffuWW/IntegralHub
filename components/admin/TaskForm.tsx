"use client";

import type { Category, Difficulty, Task, TaskStatus } from "@prisma/client";
import { useState } from "react";
import { SafeMarkdown } from "@/components/math/SafeMarkdown";
import { Button, LinkButton } from "@/components/ui/Button";

type FormTask = Partial<Pick<Task, "id" | "number" | "categoryId" | "difficulty" | "conditionMarkdown" | "expressionLatex" | "answerMarkdown" | "solutionMarkdown" | "source" | "status">>;

export function TaskForm({ categories, task }: { categories: Category[]; task?: FormTask }) {
  const [solution, setSolution] = useState(task?.solutionMarkdown ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(formData: FormData, publish = false) {
    setSaving(true);
    setError("");
    const payload = {
      number: formData.get("number") || undefined,
      categoryId: formData.get("categoryId"),
      difficulty: formData.get("difficulty") as Difficulty,
      conditionMarkdown: formData.get("conditionMarkdown"),
      expressionLatex: formData.get("expressionLatex"),
      answerMarkdown: formData.get("answerMarkdown"),
      solutionMarkdown: formData.get("solutionMarkdown"),
      source: formData.get("source"),
      status: publish ? "PUBLISHED" : formData.get("status") as TaskStatus
    };
    const response = await fetch(task?.id ? `/api/admin/tasks/${task.id}` : "/api/admin/tasks", {
      method: task?.id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json() as { success: boolean; error?: { message: string } };
    setSaving(false);
    if (json.success) window.location.href = "/admin/tasks";
    else setError(json.error?.message ?? "Не удалось сохранить");
  }

  return (
    <form className="grid gap-4" action={(formData) => submit(formData)}>
      <div className="grid gap-4 md:grid-cols-3">
        <label><span className="mb-1 block font-semibold">Номер</span><input name="number" defaultValue={task?.number ?? ""} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" placeholder="авто" /></label>
        <label><span className="mb-1 block font-semibold">Категория</span><select name="categoryId" required defaultValue={task?.categoryId ?? categories[0]?.id} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label><span className="mb-1 block font-semibold">Сложность</span><select name="difficulty" defaultValue={task?.difficulty ?? "EASY"} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2"><option value="EASY">Лёгкий</option><option value="MEDIUM">Средний</option><option value="HARD">Сложный</option></select></label>
      </div>
      <label><span className="mb-1 block font-semibold">Условие</span><textarea name="conditionMarkdown" required defaultValue={task?.conditionMarkdown ?? ""} rows={4} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label><span className="mb-1 block font-semibold">Основная формула LaTeX</span><input name="expressionLatex" required defaultValue={task?.expressionLatex ?? ""} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label><span className="mb-1 block font-semibold">Ответ</span><textarea name="answerMarkdown" required defaultValue={task?.answerMarkdown ?? ""} rows={3} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <div className="grid gap-4 lg:grid-cols-2">
        <label><span className="mb-1 block font-semibold">Решение: редактор</span><textarea name="solutionMarkdown" required value={solution} onChange={(e) => setSolution(e.target.value)} rows={12} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="mb-2 font-semibold">Предпросмотр</p><SafeMarkdown content={solution || "Пока пусто"} /></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label><span className="mb-1 block font-semibold">Источник</span><input name="source" defaultValue={task?.source ?? ""} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label><span className="mb-1 block font-semibold">Состояние</span><select name="status" defaultValue={task?.status ?? "HIDDEN"} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2"><option value="PUBLISHED">Опубликовано</option><option value="HIDDEN">Скрыто</option><option value="ARCHIVED">Архив</option></select></label>
      </div>
      {error && <pre className="whitespace-pre-wrap rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</pre>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>Сохранить</Button>
        <Button type="button" disabled={saving} onClick={(event) => submit(new FormData(event.currentTarget.form ?? undefined), true)}>Сохранить и опубликовать</Button>
        <LinkButton href="/admin/tasks" variant="secondary">Отмена</LinkButton>
      </div>
    </form>
  );
}
