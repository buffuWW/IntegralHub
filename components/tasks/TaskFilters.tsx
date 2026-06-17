"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";

type CategoryOption = { slug: string; name: string };

export function TaskFilters({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function update(formData: FormData) {
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (String(value)) params.set(key, String(value));
    }
    router.push(`/tasks?${params.toString()}`);
    setOpen(false);
  }

  const form = (
    <form action={update} className="grid gap-3 md:grid-cols-2 lg:grid-cols-12">
      <label className="lg:col-span-3">
        <span className="mb-1 block text-sm font-semibold">Поиск</span>
        <input name="q" defaultValue={searchParams.get("q") ?? ""} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" placeholder="номер, формула, условие" />
      </label>
      <label className="lg:col-span-2">
        <span className="mb-1 block text-sm font-semibold">Категория</span>
        <select name="category" defaultValue={searchParams.get("category") ?? ""} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2">
          <option value="">Все</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </label>
      <label className="lg:col-span-2">
        <span className="mb-1 block text-sm font-semibold">Сложность</span>
        <select name="difficulty" defaultValue={searchParams.get("difficulty") ?? ""} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2">
          <option value="">Все</option>
          <option value="easy">Лёгкий</option>
          <option value="medium">Средний</option>
          <option value="hard">Сложный</option>
        </select>
      </label>
      <label className="lg:col-span-2">
        <span className="mb-1 block text-sm font-semibold">Статус</span>
        <select name="userStatus" defaultValue={searchParams.get("userStatus") ?? ""} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2">
          <option value="">Все</option>
          <option value="UNSEEN">Не открывалось</option>
          <option value="VIEWED">Просмотрено</option>
          <option value="SOLVED">Решено</option>
          <option value="REVIEW">Повторить</option>
        </select>
      </label>
      <label className="lg:col-span-2">
        <span className="mb-1 block text-sm font-semibold">Сортировка</span>
        <select name="sort" defaultValue={searchParams.get("sort") ?? "new"} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2">
          <option value="new">Сначала новые</option>
          <option value="old">Сначала старые</option>
          <option value="number-asc">Номер ↑</option>
          <option value="number-desc">Номер ↓</option>
          <option value="easy">Сначала лёгкие</option>
          <option value="hard">Сначала сложные</option>
        </select>
      </label>
      <div className="grid min-w-0 grid-cols-2 items-end gap-2 md:col-span-2 lg:col-span-1 lg:grid-cols-1">
        <Button type="submit" className="w-full px-3 text-sm">Применить</Button>
        <LinkButton href="/tasks" variant="secondary" className="w-full px-3 text-sm">Сбросить</LinkButton>
      </div>
    </form>
  );

  return (
    <>
      <div className="mb-4 md:hidden">
        <Button onClick={() => setOpen(true)} variant="secondary"><SlidersHorizontal size={18} />Фильтры</Button>
      </div>
      <div className="hidden rounded-lg border border-slate-200 bg-white p-4 md:block">{form}</div>
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 p-4 md:hidden">
          <div className="ml-auto h-full max-w-sm overflow-y-auto rounded-lg bg-white p-4">
            <button className="focus-ring mb-3 rounded p-2" onClick={() => setOpen(false)}><X /></button>
            {form}
          </div>
        </div>
      )}
    </>
  );
}
