import { AdminShell } from "@/components/admin/AdminShell";
import { TaskForm } from "@/components/admin/TaskForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <AdminShell>
      <h1 className="mb-5 text-3xl font-black">Новое задание</h1>
      <TaskForm categories={categories} />
    </AdminShell>
  );
}
