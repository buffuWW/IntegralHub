"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { loadProgress } from "@/lib/progress";

const importedKey = "integral-hub-progress-imported-v1";

export function GuestProgressImportPrompt() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((json: { data: { authenticated: boolean } }) => {
      const progress = loadProgress();
      const hasProgress = Object.keys(progress.tasks).length > 0;
      if (json.data.authenticated && hasProgress && window.localStorage.getItem(importedKey) !== "true") setVisible(true);
    }).catch(() => undefined);
  }, []);

  async function importProgress() {
    const progress = loadProgress();
    const response = await fetch("/api/progress/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tasks: progress.tasks })
    });
    const json = await response.json() as { success: boolean; data?: { imported: number }; error?: { message: string } };
    if (json.success) {
      window.localStorage.setItem(importedKey, "true");
      setMessage(`Перенесено записей: ${json.data?.imported ?? 0}`);
      setTimeout(() => setVisible(false), 1200);
    } else {
      setMessage(json.error?.message ?? "Не удалось перенести прогресс");
    }
  }

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-live="polite">
      <div className="max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold">Найден локальный прогресс</h2>
        <p className="mt-2 text-slate-700">В этом браузере найден сохранённый прогресс. Перенести его в ваш аккаунт?</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={importProgress}>Перенести и объединить</Button>
          <Button variant="secondary" onClick={() => { window.localStorage.setItem(importedKey, "true"); setVisible(false); }}>Не переносить</Button>
          <Button variant="secondary" onClick={() => setVisible(false)}>Напомнить позже</Button>
        </div>
        {message && <p className="mt-3 text-sm font-semibold text-indigo-700">{message}</p>}
      </div>
    </div>
  );
}
