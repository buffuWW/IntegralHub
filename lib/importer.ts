import { ImportStatus, TaskStatus } from "@prisma/client";
import JSZip from "jszip";
import Papa from "papaparse";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { computeDuplicateHash } from "@/lib/duplicates";
import { validateLatex, validateMarkdownMath } from "@/lib/math-validation";
import { normalizeDifficulty, normalizePublished, parsePositiveInt } from "@/lib/normalizers";
import { prisma } from "@/lib/prisma";
import { localStorageService } from "@/lib/storage/local";
import { getImageMimeType, isSafeFileName, validateSvgContent } from "@/lib/storage/validation";

export type ImportError = { row?: number; field?: string; message: string; fragment?: string; existingNumber?: number };
export type ImportWarning = { row?: number; field?: string; message: string };
type CsvRow = Record<string, string>;

const required = ["category", "difficulty", "condition", "expression_latex", "answer", "solution"];
const maxUploadBytes = 50 * 1024 * 1024;
const maxImageBytes = 5 * 1024 * 1024;

function detectDelimiter(csv: string) {
  const firstLine = csv.split(/\r?\n/)[0] ?? "";
  return firstLine.split(";").length >= firstLine.split(",").length ? ";" : ",";
}

function stripBom(csv: string) {
  return csv.replace(/^\uFEFF/, "");
}

export async function parseImportFile(file: File) {
  if (file.size > maxUploadBytes) throw new Error("Файл больше 50 МБ");
  const bytes = Buffer.from(await file.arrayBuffer());
  const tempRoot = path.join(process.cwd(), "storage", "tmp", randomUUID());
  await fs.mkdir(tempRoot, { recursive: true });

  if (file.name.toLowerCase().endsWith(".zip")) {
    const zip = await JSZip.loadAsync(bytes);
    const csvEntry = zip.file("tasks.csv");
    if (!csvEntry) throw new Error("В ZIP должен быть файл tasks.csv");
    const csv = await csvEntry.async("string");
    const imagesDir = path.join(tempRoot, "images");
    await fs.mkdir(imagesDir, { recursive: true });
    for (const entryName of Object.keys(zip.files)) {
      const entry = zip.files[entryName];
      if (entry.dir || !entryName.startsWith("images/")) continue;
      const fileName = path.basename(entryName);
      if (!isSafeFileName(fileName)) throw new Error(`Опасное имя файла: ${entryName}`);
      const buffer = Buffer.from(await entry.async("uint8array"));
      await fs.writeFile(path.join(imagesDir, fileName), buffer);
    }
    return { csv, tempDir: tempRoot, originalFileName: file.name };
  }

  return { csv: bytes.toString("utf8"), tempDir: tempRoot, originalFileName: file.name };
}

export function parseCsv(csv: string): CsvRow[] {
  const result = Papa.parse<CsvRow>(stripBom(csv), {
    header: true,
    delimiter: detectDelimiter(csv),
    skipEmptyLines: true,
    transform: (value) => value.replace(/\\n/g, "\n")
  });
  if (result.errors.length > 0) throw new Error(result.errors.map((e) => e.message).join("; "));
  return result.data;
}

export async function validateRows(rows: CsvRow[], tempDir: string | null) {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];
  if (rows.length > 1000) errors.push({ message: "За один импорт можно загрузить не более 1000 заданий" });
  const categories = await prisma.category.findMany();
  const bySlugOrName = new Map(categories.flatMap((c) => [[c.slug.toLowerCase(), c], [c.name.toLowerCase(), c]]));
  const existingNumbers = new Set((await prisma.task.findMany({ select: { number: true } })).map((t) => t.number));
  const existingHashes = new Map((await prisma.task.findMany({ select: { number: true, duplicateHash: true } })).map((t) => [t.duplicateHash, t.number]));
  const usedNumbers = new Set<number>();
  const usedHashes = new Set<string>();
  let nextNumber = Math.max(0, ...existingNumbers) + 1;

  const prepared = [];
  for (const [index, row] of rows.entries()) {
    const csvRow = index + 2;
    for (const field of required) {
      if (!(field in row) || !row[field]?.trim()) errors.push({ row: csvRow, field, message: "Обязательное поле пустое" });
    }
    const category = bySlugOrName.get((row.category ?? "").trim().toLowerCase());
    if (!category) errors.push({ row: csvRow, field: "category", message: "Категория не найдена" });
    const difficulty = normalizeDifficulty(row.difficulty ?? "");
    if (!difficulty) errors.push({ row: csvRow, field: "difficulty", message: "Некорректная сложность" });
    const status = normalizePublished(row.published);
    if (!status) errors.push({ row: csvRow, field: "published", message: "Некорректное значение опубликованности" });
    let number = parsePositiveInt(row.number);
    if (row.number && !number) errors.push({ row: csvRow, field: "number", message: "Номер должен быть положительным целым" });
    while (!number && (existingNumbers.has(nextNumber) || usedNumbers.has(nextNumber))) nextNumber += 1;
    number ??= nextNumber++;
    if (existingNumbers.has(number)) errors.push({ row: csvRow, field: "number", message: "Номер уже существует", existingNumber: number });
    if (usedNumbers.has(number)) errors.push({ row: csvRow, field: "number", message: "Номер повторяется в CSV" });
    usedNumbers.add(number);

    const expressionError = validateLatex(row.expression_latex ?? "");
    if (expressionError) errors.push({ row: csvRow, field: "expression_latex", message: expressionError, fragment: row.expression_latex });
    for (const [field, value] of [["condition", row.condition], ["answer", row.answer], ["solution", row.solution]] as const) {
      for (const mathError of validateMarkdownMath(value ?? "")) errors.push({ row: csvRow, field, message: mathError.message, fragment: mathError.fragment });
    }

    const imageNames = (row.image_filenames ?? "").split("|").map((v) => v.trim()).filter(Boolean);
    const altTexts = (row.image_alt_texts ?? "").split("|").map((v) => v.trim());
    if (imageNames.length > 10) errors.push({ row: csvRow, field: "image_filenames", message: "Не более 10 изображений на задание" });
    if (altTexts.filter(Boolean).length < imageNames.length) warnings.push({ row: csvRow, field: "image_alt_texts", message: "Для части изображений не указан alt-текст" });
    for (const name of imageNames) {
      if (!isSafeFileName(name)) errors.push({ row: csvRow, field: "image_filenames", message: `Опасное имя файла: ${name}` });
      const mime = getImageMimeType(name);
      if (!mime) errors.push({ row: csvRow, field: "image_filenames", message: `Недопустимый формат изображения: ${name}` });
      const imagePath = tempDir ? path.join(tempDir, "images", name) : "";
      const stat = imagePath ? await fs.stat(imagePath).catch(() => null) : null;
      if (!stat) errors.push({ row: csvRow, field: "image_filenames", message: `Изображение не найдено: ${name}` });
      else if (stat.size > maxImageBytes) errors.push({ row: csvRow, field: "image_filenames", message: `Изображение больше 5 МБ: ${name}` });
      if (mime === "image/svg+xml" && stat) {
        const svgError = validateSvgContent(await fs.readFile(imagePath, "utf8"));
        if (svgError) errors.push({ row: csvRow, field: "image_filenames", message: `${name}: ${svgError}` });
      }
    }

    const duplicateHash = category ? computeDuplicateHash({
      categoryId: category.id,
      conditionMarkdown: row.condition ?? "",
      expressionLatex: row.expression_latex ?? "",
      answerMarkdown: row.answer ?? ""
    }) : "";
    if (duplicateHash) {
      if (usedHashes.has(duplicateHash)) errors.push({ row: csvRow, message: "Дубликат внутри CSV" });
      const existingNumber = existingHashes.get(duplicateHash);
      if (existingNumber) errors.push({ row: csvRow, existingNumber, message: "Дубликат уже существующего задания" });
      usedHashes.add(duplicateHash);
    }

    prepared.push({
      row: csvRow,
      number,
      categoryId: category?.id ?? "",
      categoryName: category?.name ?? row.category,
      difficulty: difficulty ?? "EASY",
      status: status ?? TaskStatus.HIDDEN,
      conditionMarkdown: row.condition ?? "",
      expressionLatex: row.expression_latex ?? "",
      answerMarkdown: row.answer ?? "",
      solutionMarkdown: row.solution ?? "",
      source: row.source || null,
      duplicateHash,
      images: imageNames.map((name, imageIndex) => ({ fileName: name, altText: altTexts[imageIndex] || null }))
    });
  }

  return { prepared, errors, warnings };
}

export async function commitImport(batchId: string) {
  const batch = await prisma.importBatch.findUnique({ where: { id: batchId } });
  if (!batch || batch.status !== ImportStatus.READY) throw new Error("Импорт не готов к подтверждению");
  const preview = batch.previewJson as { prepared: Awaited<ReturnType<typeof validateRows>>["prepared"] } | null;
  if (!preview) throw new Error("Нет данных предварительного просмотра");
  const moved: string[] = [];
  try {
    const created = await prisma.$transaction(async (tx) => {
      const result: string[] = [];
      for (const item of preview.prepared) {
        const task = await tx.task.create({
          data: {
            number: item.number,
            categoryId: item.categoryId,
            difficulty: item.difficulty,
            status: item.status,
            conditionMarkdown: item.conditionMarkdown,
            expressionLatex: item.expressionLatex,
            answerMarkdown: item.answerMarkdown,
            solutionMarkdown: item.solutionMarkdown,
            source: item.source,
            duplicateHash: item.duplicateHash,
            publishedAt: item.status === TaskStatus.PUBLISHED ? new Date() : null
          }
        });
        for (const [sortOrder, image] of item.images.entries()) {
          const tempPath = path.join(batch.tempDir ?? "", "images", image.fileName);
          const stored = await localStorageService.move(tempPath, `tasks/${task.id}`, image.fileName);
          moved.push(stored.storagePath);
          await tx.taskImage.create({ data: { taskId: task.id, sortOrder, altText: image.altText, ...stored } });
        }
        result.push(task.id);
      }
      await tx.importBatch.update({ where: { id: batchId }, data: { status: ImportStatus.COMPLETED, importedRows: result.length, completedAt: new Date() } });
      return result;
    });
    if (batch.tempDir) await fs.rm(batch.tempDir, { recursive: true, force: true });
    return created;
  } catch (error) {
    for (const storagePath of moved) await localStorageService.delete(storagePath);
    await prisma.importBatch.update({ where: { id: batchId }, data: { status: ImportStatus.FAILED, errorsJson: [{ message: error instanceof Error ? error.message : "Ошибка записи" }] } });
    throw error;
  }
}
