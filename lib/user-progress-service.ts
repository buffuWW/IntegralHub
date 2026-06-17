import { Difficulty, TaskStatus, UserTaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function toUserTaskStatus(status?: string | null): UserTaskStatus {
  if (status === "SOLVED") return UserTaskStatus.SOLVED;
  if (status === "REVIEW") return UserTaskStatus.REVIEW;
  return UserTaskStatus.VIEWED;
}

export async function upsertTaskProgress(input: {
  userId: string;
  taskId: string;
  status?: UserTaskStatus;
  answerOpened?: boolean;
  solutionOpened?: boolean;
  incrementViewCount?: boolean;
}) {
  const task = await prisma.task.findFirst({ where: { id: input.taskId, status: TaskStatus.PUBLISHED }, select: { id: true } });
  if (!task) throw new Error("Задание не найдено или недоступно");
  const now = new Date();
  return prisma.userTaskProgress.upsert({
    where: { userId_taskId: { userId: input.userId, taskId: input.taskId } },
    create: {
      userId: input.userId,
      taskId: input.taskId,
      status: input.status ?? UserTaskStatus.VIEWED,
      answerOpened: input.answerOpened ?? false,
      solutionOpened: input.solutionOpened ?? false,
      viewCount: input.incrementViewCount ? 1 : 0,
      firstViewedAt: now,
      lastViewedAt: now,
      statusChangedAt: input.status ? now : now
    },
    update: {
      status: input.status,
      answerOpened: input.answerOpened ? true : undefined,
      solutionOpened: input.solutionOpened ? true : undefined,
      viewCount: input.incrementViewCount ? { increment: 1 } : undefined,
      lastViewedAt: now,
      statusChangedAt: input.status ? now : undefined
    },
    include: { task: { include: { category: true, images: true } } }
  });
}

export async function getProgressList(userId: string, searchParams: URLSearchParams) {
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty")?.toUpperCase();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50) || 50));
  const where = {
    userId,
    status: status && status in UserTaskStatus ? status as UserTaskStatus : undefined,
    task: {
      status: TaskStatus.PUBLISHED,
      category: category ? { slug: category } : undefined,
      difficulty: difficulty && difficulty in Difficulty ? difficulty as Difficulty : undefined
    }
  };
  const [items, total] = await Promise.all([
    prisma.userTaskProgress.findMany({
      where,
      include: { task: { include: { category: true, images: true } } },
      orderBy: { lastViewedAt: searchParams.get("sort") === "old" ? "asc" : "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.userTaskProgress.count({ where })
  ]);
  return { items, total, page, pageCount: Math.ceil(total / limit) };
}

export async function getProgressStats(userId: string) {
  const [publishedTotal, progress, categories, difficulties, latest] = await Promise.all([
    prisma.task.count({ where: { status: TaskStatus.PUBLISHED } }),
    prisma.userTaskProgress.findMany({ where: { userId }, include: { task: { include: { category: true } } } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { tasks: { where: { status: TaskStatus.PUBLISHED } } } } } }),
    Promise.resolve(Object.values(Difficulty)),
    prisma.userTaskProgress.findMany({
      where: { userId },
      orderBy: { lastViewedAt: "desc" },
      take: 8,
      include: { task: { include: { category: true, images: true } } }
    })
  ]);
  const solved = progress.filter((p) => p.status === UserTaskStatus.SOLVED);
  const review = progress.filter((p) => p.status === UserTaskStatus.REVIEW);
  const viewed = progress.filter((p) => p.status === UserTaskStatus.VIEWED);
  return {
    publishedTotal,
    viewedCount: progress.length,
    solvedCount: solved.length,
    reviewCount: review.length,
    unratedCount: viewed.length,
    answersOpened: progress.filter((p) => p.answerOpened).length,
    solutionsOpened: progress.filter((p) => p.solutionOpened).length,
    solvedPercent: publishedTotal ? Math.round((solved.length / publishedTotal) * 100) : 0,
    byCategory: categories.map((category) => ({
      id: category.id,
      name: category.name,
      total: category._count.tasks,
      solved: solved.filter((item) => item.task.categoryId === category.id).length
    })),
    byDifficulty: difficulties.map((difficulty) => ({
      difficulty,
      solved: solved.filter((item) => item.task.difficulty === difficulty).length,
      total: 0
    })),
    latest,
    latestSolved: solved.sort((a, b) => b.statusChangedAt.getTime() - a.statusChangedAt.getTime()).slice(0, 8),
    review: review.slice(0, 8)
  };
}

export async function importGuestProgress(userId: string, tasks: Record<string, {
  status?: string;
  firstViewedAt?: string;
  lastViewedAt?: string;
  statusChangedAt?: string;
  viewCount?: number;
  answerOpened?: boolean;
  solutionOpened?: boolean;
}>) {
  const numbers = Object.keys(tasks).map(Number).filter(Number.isInteger);
  const dbTasks = await prisma.task.findMany({ where: { number: { in: numbers }, status: TaskStatus.PUBLISHED }, select: { id: true, number: true } });
  const taskByNumber = new Map(dbTasks.map((task) => [task.number, task]));
  return prisma.$transaction(async (tx) => {
    let imported = 0;
    for (const [numberRaw, value] of Object.entries(tasks)) {
      const task = taskByNumber.get(Number(numberRaw));
      if (!task) continue;
      const firstViewedAt = value.firstViewedAt ? new Date(value.firstViewedAt) : new Date();
      const lastViewedAt = value.lastViewedAt ? new Date(value.lastViewedAt) : firstViewedAt;
      const statusChangedAt = value.statusChangedAt ? new Date(value.statusChangedAt) : lastViewedAt;
      const incomingStatus = toUserTaskStatus(value.status);
      const existing = await tx.userTaskProgress.findUnique({ where: { userId_taskId: { userId, taskId: task.id } } });
      const status = existing && existing.statusChangedAt > statusChangedAt ? existing.status : incomingStatus;
      await tx.userTaskProgress.upsert({
        where: { userId_taskId: { userId, taskId: task.id } },
        create: {
          userId,
          taskId: task.id,
          status,
          answerOpened: Boolean(value.answerOpened),
          solutionOpened: Boolean(value.solutionOpened),
          viewCount: Math.min(100000, Math.max(0, value.viewCount ?? 0)),
          firstViewedAt,
          lastViewedAt,
          statusChangedAt
        },
        update: {
          status,
          answerOpened: existing?.answerOpened || value.answerOpened ? true : false,
          solutionOpened: existing?.solutionOpened || value.solutionOpened ? true : false,
          viewCount: { increment: Math.min(100000, Math.max(0, value.viewCount ?? 0)) },
          firstViewedAt: existing && existing.firstViewedAt < firstViewedAt ? existing.firstViewedAt : firstViewedAt,
          lastViewedAt: existing && existing.lastViewedAt > lastViewedAt ? existing.lastViewedAt : lastViewedAt,
          statusChangedAt: status === incomingStatus ? statusChangedAt : existing?.statusChangedAt
        }
      });
      imported += 1;
    }
    return { imported };
  });
}
