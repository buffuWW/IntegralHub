import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { deleteUserSession } from "@/lib/user-auth";

export async function POST(request: NextRequest) {
  await deleteUserSession(request);
  return ok({ authenticated: false });
}
