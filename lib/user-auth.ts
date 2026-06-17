import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

const userCookieName = "integral_hub_user";
const sessionDays = 30;

export type SafeUser = {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
};

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function sessionExpiry(): Date {
  return new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
}

export async function cleanupExpiredUserSessions() {
  await prisma.userSession.deleteMany({ where: { expiresAt: { lte: new Date() } } });
}

export async function createUserSession(userId: string) {
  await cleanupExpiredUserSessions();
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = sessionExpiry();
  await prisma.userSession.create({
    data: { userId, tokenHash: hashToken(token), expiresAt }
  });
  const cookieStore = await cookies();
  cookieStore.set(userCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });
}

export async function getCurrentUser(request?: NextRequest): Promise<SafeUser | null> {
  const token = request ? request.cookies.get(userCookieName)?.value : (await cookies()).get(userCookieName)?.value;
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await prisma.userSession.findUnique({
    where: { tokenHash },
    include: { user: true }
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.userSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  await prisma.userSession.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
  return {
    id: session.user.id,
    email: session.user.email,
    displayName: session.user.displayName,
    createdAt: session.user.createdAt
  };
}

export async function requireUser(request?: NextRequest): Promise<SafeUser> {
  const user = await getCurrentUser(request);
  if (!user) throw new Error("USER_UNAUTHORIZED");
  return user;
}

export async function requireUserPage(returnTo?: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`);
  return user;
}

export async function deleteUserSession(request?: NextRequest) {
  const cookieStore = await cookies();
  const token = request ? request.cookies.get(userCookieName)?.value : cookieStore.get(userCookieName)?.value;
  if (token) await prisma.userSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.set(userCookieName, "", { path: "/", maxAge: 0 });
}

export { hashPassword, verifyPassword };

export async function checkUserLoginRateLimit(ip: string, email: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 15 * 60 * 1000);
  const key = `${ip}:${email.toLowerCase()}`;
  await prisma.userLoginAttempt.deleteMany({ where: { createdAt: { lt: windowStart } } });
  const count = await prisma.userLoginAttempt.count({ where: { key, createdAt: { gte: windowStart } } });
  return count < 5;
}

export async function recordFailedUserLogin(ip: string, email: string) {
  await prisma.userLoginAttempt.create({ data: { key: `${ip}:${email.toLowerCase()}` } });
}
