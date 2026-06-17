import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { setAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(ip)) return fail("RATE_LIMITED", "Слишком много неудачных попыток. Попробуйте позже.", 429);
  const parsed = loginSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return fail("INVALID_INPUT", "Заполните логин и пароль", 400);
  const valid = await verifyAdminCredentials(parsed.data.login, parsed.data.password);
  if (!valid) return fail("INVALID_CREDENTIALS", "Неверный логин или пароль", 401);
  await setAdminSession(parsed.data.login);
  return ok({ authenticated: true });
}
