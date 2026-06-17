import { AdminShell } from "@/components/admin/AdminShell";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { tasks: true } } } });
  return (
    <AdminShell>
      <h1 className="mb-5 text-3xl font-black">Категории</h1>
      <CategoryManager categories={categories} />
    </AdminShell>
  );
}
