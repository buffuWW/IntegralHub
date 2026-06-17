"use client";

import { Menu, Shuffle, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const links = [
  ["Главная", "/"],
  ["Все задания", "/tasks"],
  ["История", "/history"],
  ["Повторение", "/review"]
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  async function randomTask() {
    const solved = localStorage.getItem("integral-hub-progress-v1");
    const response = await fetch("/api/tasks/random", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ solvedNumbers: solved ? Object.entries(JSON.parse(solved).tasks ?? {}).filter(([, v]) => (v as { status?: string }).status === "SOLVED").map(([n]) => Number(n)) : [] })
    });
    const json = (await response.json()) as { success: boolean; data?: { number: number } };
    if (json.success && json.data) window.location.href = `/tasks/${json.data.number}`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-black text-indigo-700">Integral Hub</Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Основная навигация">
          {links.map(([label, href]) => <Link key={href} className="focus-ring rounded px-1 py-1 text-slate-700 hover:text-indigo-700" href={href}>{label}</Link>)}
          <Button onClick={randomTask} className="min-h-10 px-3"><Shuffle size={18} />Случайное задание</Button>
        </nav>
        <button className="focus-ring rounded-md p-2 md:hidden" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Мобильная навигация">
          <div className="flex flex-col gap-3">
            {links.map(([label, href]) => <Link key={href} onClick={() => setOpen(false)} className="rounded-md px-2 py-2" href={href}>{label}</Link>)}
            <Button onClick={randomTask}><Shuffle size={18} />Случайное задание</Button>
          </div>
        </nav>
      )}
    </header>
  );
}
