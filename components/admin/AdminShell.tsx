import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAdminSessionFromRequest } from "@/lib/auth";

export async function AdminShell({ children }: { children: ReactNode }) {
  const session = await getAdminSessionFromRequest();
  if (!session) redirect("/admin/login");
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-3">
          <Link className="font-semibold text-indigo-700" href="/admin">Панель</Link>
          <Link href="/admin/tasks">Задания</Link>
          <Link href="/admin/tasks/new">Добавить</Link>
          <Link href="/admin/categories">Категории</Link>
          <Link href="/admin/import">Импорт</Link>
          <Link href="/admin/archive">Архив</Link>
        </nav>
        <form action={async () => {
          "use server";
          const { clearAdminSession } = await import("@/lib/auth");
          await clearAdminSession();
          redirect("/admin/login");
        }}>
          <button className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold">Выйти</button>
        </form>
      </div>
      {children}
    </main>
  );
}
