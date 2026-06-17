import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { commitImport } from "@/lib/importer";

export async function POST(request: NextRequest) {
  await requireAdmin(request);
  try {
    const body = await request.json() as { batchId?: string };
    if (!body.batchId) return fail("NO_BATCH", "Не указан batchId", 400);
    return ok({ createdIds: await commitImport(body.batchId) });
  } catch (error) {
    return fail("IMPORT_COMMIT_FAILED", error instanceof Error ? error.message : "Не удалось импортировать", 400);
  }
}
