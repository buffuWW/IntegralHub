import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { getAdminSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return ok({ session: await getAdminSessionFromRequest(request) });
}
