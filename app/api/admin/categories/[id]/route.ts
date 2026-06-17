import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/schemas";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const parsed = categoryInputSchema.safeParse(await request.json());
  if (!parsed.success) return fail("INVALID_CATEGORY", "Проверьте поля категории", 400);
  return ok(await prisma.category.update({ where: { id: (await params).id }, data: parsed.data }));
}
