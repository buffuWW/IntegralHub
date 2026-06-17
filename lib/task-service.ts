import { TaskStatus } from "@prisma/client";
import { computeDuplicateHash } from "@/lib/duplicates";
import { validateLatex, validateMarkdownMath } from "@/lib/math-validation";
import { prisma } from "@/lib/prisma";
import { taskInputSchema } from "@/lib/schemas";
import { calculatePurgeAt, purgeExpiredArchivedTasks } from "@/lib/archive";
import { localStorageService } from "@/lib/storage/local";

export async function nextTaskNumber() {
  const last = await prisma.task.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
  return (last?.number ?? 0) + 1;
}

export async function validateTaskMath(input: {
  expressionLatex: string;
  conditionMarkdown: string;
  answerMarkdown: string;
  solutionMarkdown: string;
}) {
  const errors: string[] = [];
  const expressionError = validateLatex(input.expressionLatex);
  if (expressionError) errors.push(`Основная формула: ${expressionError}`);
  for (const [field, value] of [
    ["Условие", input.conditionMarkdown],
    ["Ответ", input.answerMarkdown],
    ["Решение", input.solutionMarkdown]
  ] as const) {
    for (const error of validateMarkdownMath(value)) errors.push(`${field}: ${error.fragment} — ${error.message}`);
  }
  return errors;
}

export async function createTask(raw: unknown) {
  const input = taskInputSchema.parse(raw);
  const { images: _images, ...taskData } = input;
  const mathErrors = await validateTaskMath(input);
  if (mathErrors.length > 0) throw new Error(mathErrors.join("\n"));
  const number = input.number ?? await nextTaskNumber();
  const duplicateHash = computeDuplicateHash({
    categoryId: input.categoryId,
    conditionMarkdown: input.conditionMarkdown,
    expressionLatex: input.expressionLatex,
    answerMarkdown: input.answerMarkdown
  });
  return prisma.task.create({
    data: {
      ...taskData,
      number,
      source: input.source || null,
      duplicateHash,
      publishedAt: input.status === TaskStatus.PUBLISHED ? new Date() : null
    }
  });
}

export async function updateTask(id: string, raw: unknown) {
  const input = taskInputSchema.parse(raw);
  const { images: _images, ...taskData } = input;
  const mathErrors = await validateTaskMath(input);
  if (mathErrors.length > 0) throw new Error(mathErrors.join("\n"));
  const duplicateHash = computeDuplicateHash({
    categoryId: input.categoryId,
    conditionMarkdown: input.conditionMarkdown,
    expressionLatex: input.expressionLatex,
    answerMarkdown: input.answerMarkdown
  });
  return prisma.task.update({
    where: { id },
    data: {
      ...taskData,
      source: input.source || null,
      duplicateHash,
      publishedAt: input.status === TaskStatus.PUBLISHED ? new Date() : null,
      archivedAt: input.status === TaskStatus.ARCHIVED ? new Date() : null,
      purgeAt: input.status === TaskStatus.ARCHIVED ? calculatePurgeAt() : null
    }
  });
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  await purgeExpiredArchivedTasks();
  return prisma.task.update({
    where: { id },
    data: {
      status,
      publishedAt: status === TaskStatus.PUBLISHED ? new Date() : undefined,
      archivedAt: status === TaskStatus.ARCHIVED ? new Date() : null,
      purgeAt: status === TaskStatus.ARCHIVED ? calculatePurgeAt() : null
    }
  });
}

export async function purgeTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id }, include: { images: true } });
  if (!task) return null;
  for (const image of task.images) await localStorageService.delete(image.storagePath);
  return prisma.task.delete({ where: { id } });
}
