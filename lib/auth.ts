import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const cookieName = "integral_hub_admin";
const sessionHours = 8;

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyAdminCredentials(login: string, password: string): Promise<boolean> {
  const expectedLogin = process.env.ADMIN_LOGIN;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedLogin || !hash) return false;
  if (login !== expectedLogin) return false;
  return bcrypt.compare(password, hash);
}

export async function createAdminToken(login: string): Promise<string> {
  return new SignJWT({ role: "admin", login })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionHours}h`)
    .sign(getSecret());
}

export async function setAdminSession(login: string) {
  const token = await createAdminToken(login);
  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionHours * 60 * 60
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, "", { path: "/", maxAge: 0 });
}

export async function getAdminSessionFromRequest(request?: NextRequest) {
  const token = request ? request.cookies.get(cookieName)?.value : (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, getSecret());
    return verified.payload.role === "admin"
      ? { login: String(verified.payload.login ?? "admin") }
      : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(request?: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
