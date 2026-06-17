import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const batch = await prisma.importBatch.findUnique({ where: { id: (await params).id } });
  return batch ? ok(batch) : fail("NOT_FOUND", "Импорт не найден", 404);
}
