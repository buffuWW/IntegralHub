import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { TaskForm } from "@/components/admin/TaskForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [task, categories] = await Promise.all([
    prisma.task.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } })
  ]);
  if (!task) notFound();
  return (
    <AdminShell>
      <h1 className="mb-5 text-3xl font-black">Редактирование задания №{task.number}</h1>
      <TaskForm categories={categories} task={task} />
    </AdminShell>
  );
}
