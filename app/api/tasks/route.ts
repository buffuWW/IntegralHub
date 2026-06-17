import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { buildOrderBy, buildPublicTaskWhere, getPagination } from "@/lib/task-query";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const where = buildPublicTaskWhere(params);
  const { page, take, skip } = getPagination(params);
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      take,
      skip,
      orderBy: buildOrderBy(params.get("sort")),
      include: { category: true, images: true }
    }),
    prisma.task.count({ where })
  ]);
  return ok({ tasks, total, page, pageCount: Math.ceil(total / take) });
}
