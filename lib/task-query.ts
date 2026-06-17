import { Difficulty, Prisma, TaskStatus } from "@prisma/client";
import { pageSize } from "@/lib/constants";

export function buildPublicTaskWhere(params: URLSearchParams): Prisma.TaskWhereInput {
  const search = params.get("q")?.trim();
  const category = params.get("category");
  const difficulty = params.get("difficulty")?.toUpperCase();
  const where: Prisma.TaskWhereInput = { status: TaskStatus.PUBLISHED };

  if (category) where.category = { slug: category };
  if (difficulty && difficulty in Difficulty) where.difficulty = difficulty as Difficulty;
  if (search) {
    const number = Number(search);
    where.OR = [
      Number.isInteger(number) ? { number } : {},
      { conditionMarkdown: { contains: search, mode: "insensitive" } },
      { expressionLatex: { contains: search, mode: "insensitive" } },
      { category: { name: { contains: search, mode: "insensitive" } } }
    ];
  }
  return where;
}

export function buildOrderBy(sort: string | null): Prisma.TaskOrderByWithRelationInput {
  switch (sort) {
    case "old":
      return { createdAt: "asc" };
    case "number-asc":
      return { number: "asc" };
    case "number-desc":
      return { number: "desc" };
    case "easy":
      return { difficulty: "asc" };
    case "hard":
      return { difficulty: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export function getPagination(params: URLSearchParams) {
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  return { page, take: pageSize, skip: (page - 1) * pageSize };
}
