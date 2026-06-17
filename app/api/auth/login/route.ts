import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { checkUserLoginRateLimit, createUserSession, recordFailedUserLogin, verifyPassword } from "@/lib/user-auth";
import { userLoginSchema } from "@/lib/user-schemas";

export async function POST(request: NextRequest) {
  const parsed = userLoginSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return fail("INVALID_LOGIN_DATA", "Неверная электронная почта или пароль", 401);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const allowed = await checkUserLoginRateLimit(ip, parsed.data.email);
  if (!allowed) return fail("RATE_LIMITED", "Слишком много попыток входа. Попробуйте позже", 429);
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await recordFailedUserLogin(ip, parsed.data.email);
    return fail("INVALID_CREDENTIALS", "Неверная электронная почта или пароль", 401);
  }
  await createUserSession(user.id);
  return ok({ authenticated: true, user: { id: user.id, email: user.email, displayName: user.displayName } });
}
