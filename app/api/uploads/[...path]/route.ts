import { NextRequest, NextResponse } from "next/server";
import { localStorageService } from "@/lib/storage/local";
import { getImageMimeType } from "@/lib/storage/validation";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const storagePath = path.join("/");
  const buffer = await localStorageService.read(storagePath).catch(() => null);
  if (!buffer) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "content-type": getImageMimeType(storagePath) ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable"
    }
  });
}
