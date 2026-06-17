import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { localStorageService } from "@/lib/storage/local";

export function calculatePurgeAt(now = new Date()): Date {
  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

export async function purgeExpiredArchivedTasks(now = new Date()) {
  const expired = await prisma.task.findMany({
    where: { status: TaskStatus.ARCHIVED, purgeAt: { lte: now } },
    include: { images: true }
  });

  let imageCount = 0;
  for (const task of expired) {
    for (const image of task.images) {
      await localStorageService.delete(image.storagePath);
      imageCount += 1;
    }
    await prisma.task.delete({ where: { id: task.id } });
  }

  return { tasksDeleted: expired.length, imagesDeleted: imageCount };
}
