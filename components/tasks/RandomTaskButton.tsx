"use client";

import { Shuffle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

function solvedNumbers(): number[] {
  const raw = window.localStorage.getItem("integral-hub-progress-v1");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as { tasks?: Record<string, { status?: string }> };
    return Object.entries(parsed.tasks ?? {}).filter(([, task]) => task.status === "SOLVED").map(([number]) => Number(number));
  } catch {
    return [];
  }
}

export function RandomTaskButton({ query = "", label = "Случайное задание" }: { query?: string; label?: string }) {
  const [message, setMessage] = useState("");

  async function pick() {
    setMessage("");
    const response = await fetch(`/api/tasks/random${query ? `?${query}` : ""}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ solvedNumbers: solvedNumbers() })
    });
    const json = await response.json() as { success: boolean; data?: { number: number }; error?: { message: string } };
    if (json.success && json.data) window.location.href = `/tasks/${json.data.number}`;
    else setMessage(json.error?.message ?? "Подходящих заданий не найдено. Попробуйте изменить фильтры.");
  }

  return (
    <span className="inline-flex flex-col gap-2">
      <Button type="button" variant="secondary" onClick={pick}><Shuffle size={18} />{label}</Button>
      {message && <span className="max-w-xs text-sm font-semibold text-amber-700">{message}</span>}
    </span>
  );
}
