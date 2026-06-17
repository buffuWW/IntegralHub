import { NextResponse } from "next/server";

export type ApiErrorDetail = {
  row?: number;
  field?: string;
  message: string;
  fragment?: string;
  existingNumber?: number;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(code: string, message: string, status = 400, details?: ApiErrorDetail[]) {
  return NextResponse.json(
    { success: false, error: { code, message, details: details ?? [] } },
    { status }
  );
}
