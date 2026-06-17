import { ReviewClient } from "@/components/progress/ReviewClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } });
  return <ReviewClient categories={categories} />;
}
