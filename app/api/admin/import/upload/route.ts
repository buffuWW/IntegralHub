import { ImportStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { parseCsv, parseImportFile, validateRows } from "@/lib/importer";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  await requireAdmin(request);
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("NO_FILE", "Файл не передан", 400);
    const parsedFile = await parseImportFile(file);
    const rows = parseCsv(parsedFile.csv);
    const validation = await validateRows(rows, parsedFile.tempDir);
    const batch = await prisma.importBatch.create({
      data: {
        originalFileName: parsedFile.originalFileName,
        status: validation.errors.length > 0 ? ImportStatus.FAILED : ImportStatus.READY,
        totalRows: rows.length,
        errorCount: validation.errors.length,
        errorsJson: validation.errors,
        previewJson: { prepared: validation.prepared, warnings: validation.warnings },
        tempDir: parsedFile.tempDir
      }
    });
    return ok({ batch, preview: validation });
  } catch (error) {
    return fail("IMPORT_UPLOAD_FAILED", error instanceof Error ? error.message : "Не удалось обработать файл", 400);
  }
}
