import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { createUserSession, hashPassword } from "@/lib/user-auth";
import { registerSchema } from "@/lib/user-schemas";

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return fail("INVALID_REGISTER_DATA", "Проверьте данные регистрации", 400);
  try {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        displayName: parsed.data.displayName,
        passwordHash: await hashPassword(parsed.data.password)
      },
      select: { id: true, email: true, displayName: true, createdAt: true }
    });
    await createUserSession(user.id);
    return ok({ authenticated: true, user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("EMAIL_EXISTS", "Пользователь с такой электронной почтой уже зарегистрирован", 409);
    }
    return fail("REGISTER_FAILED", "Не удалось зарегистрироваться", 500);
  }
}
