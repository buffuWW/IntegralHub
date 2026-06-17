import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  await requireAdmin(request);
  return ok(await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { tasks: true } } } }));
}

export async function POST(request: NextRequest) {
  await requireAdmin(request);
  const parsed = categoryInputSchema.safeParse(await request.json());
  if (!parsed.success) return fail("INVALID_CATEGORY", "Проверьте поля категории", 400);
  return ok(await prisma.category.create({ data: parsed.data }), { status: 201 });
}
