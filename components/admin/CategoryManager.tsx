"use client";

import type { Category } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type CategoryWithCount = Category & { _count: { tasks: number } };

export function CategoryManager({ categories }: { categories: CategoryWithCount[] }) {
  const [items, setItems] = useState(categories);

  async function save(formData: FormData, id?: string) {
    const payload = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive") === "on"
    };
    await fetch(id ? `/api/admin/categories/${id}` : "/api/admin/categories", {
      method: id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await fetch("/api/admin/categories").then((r) => r.json()) as { success: true; data: CategoryWithCount[] };
    setItems(json.data);
  }

  return (
    <div className="grid gap-4">
      <form action={(fd) => save(fd)} className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-xl font-bold">Новая категория</h2>
        <div className="grid gap-3 md:grid-cols-5">
          <input name="name" required placeholder="Название" className="focus-ring rounded-md border border-slate-300 px-3 py-2" />
          <input name="slug" required placeholder="slug" className="focus-ring rounded-md border border-slate-300 px-3 py-2" />
          <input name="description" required placeholder="Описание" className="focus-ring rounded-md border border-slate-300 px-3 py-2 md:col-span-2" />
          <input name="sortOrder" type="number" defaultValue="10" className="focus-ring rounded-md border border-slate-300 px-3 py-2" />
        </div>
        <label className="mt-3 flex gap-2"><input name="isActive" type="checkbox" defaultChecked /> Активна</label>
        <Button className="mt-3">Создать</Button>
      </form>
      {items.map((category) => (
        <form key={category.id} action={(fd) => save(fd, category.id)} className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="grid gap-3 md:grid-cols-5">
            <input name="name" defaultValue={category.name} className="focus-ring rounded-md border border-slate-300 px-3 py-2" />
            <input name="slug" defaultValue={category.slug} className="focus-ring rounded-md border border-slate-300 px-3 py-2" />
            <input name="description" defaultValue={category.description} className="focus-ring rounded-md border border-slate-300 px-3 py-2 md:col-span-2" />
            <input name="sortOrder" type="number" defaultValue={category.sortOrder} className="focus-ring rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label className="flex gap-2"><input name="isActive" type="checkbox" defaultChecked={category.isActive} /> Активна</label>
            <span className="text-sm text-slate-600">Связанных заданий: {category._count.tasks}</span>
            <Button>Сохранить</Button>
          </div>
        </form>
      ))}
    </div>
  );
}
