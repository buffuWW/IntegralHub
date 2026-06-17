import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/user-auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  return ok({ authenticated: Boolean(user), user });
}
