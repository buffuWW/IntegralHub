import { describe, expect, it, vi, beforeEach } from "vitest";
import { calculatePurgeAt } from "@/lib/archive";
import { computeDuplicateHash } from "@/lib/duplicates";
import { extractMathBlocks, validateLatex } from "@/lib/math-validation";
import { normalizeDifficulty, normalizePublished, parsePositiveInt } from "@/lib/normalizers";
import { getImageMimeType, isSafeFileName, validateSvgContent } from "@/lib/storage/validation";
import { hashPassword, verifyPassword } from "@/lib/password";
import { registerSchema, userLoginSchema } from "@/lib/user-schemas";
import { toUserTaskStatus } from "@/lib/user-progress-service";

describe("normalizers", () => {
  it("normalizes difficulty and publication", () => {
    expect(normalizeDifficulty("лёгкий")).toBe("EASY");
    expect(normalizeDifficulty("medium")).toBe("MEDIUM");
    expect(normalizeDifficulty("сложный")).toBe("HARD");
    expect(normalizePublished("да")).toBe("PUBLISHED");
    expect(normalizePublished("нет")).toBe("HIDDEN");
    expect(parsePositiveInt("12")).toBe(12);
    expect(parsePositiveInt("-1")).toBeNull();
  });
});

describe("duplicates", () => {
  it("computes stable duplicate hash", () => {
    const a = computeDuplicateHash({ categoryId: "c", conditionMarkdown: " A  B ", expressionLatex: "\\int x dx", answerMarkdown: "X" });
    const b = computeDuplicateHash({ categoryId: "c", conditionMarkdown: "a b", expressionLatex: "\\int x dx", answerMarkdown: "x" });
    expect(a).toBe(b);
  });
});

describe("math validation", () => {
  it("validates latex and extracts math blocks", () => {
    expect(validateLatex("\\int_0^1 x\\,dx")).toBeNull();
    expect(validateLatex("\\badcommand")).toContain("Undefined");
    expect(extractMathBlocks("Текст $x^2$ и $$\\int x dx$$")).toHaveLength(2);
  });
});

describe("storage validation", () => {
  it("validates file names and svg", () => {
    expect(isSafeFileName("area.png")).toBe(true);
    expect(isSafeFileName("../secret.png")).toBe(false);
    expect(getImageMimeType("a.webp")).toBe("image/webp");
    expect(validateSvgContent("<svg><script /></svg>")).toBeTruthy();
  });
});

describe("archive", () => {
  it("calculates purge time 24 hours later", () => {
    const now = new Date("2026-06-17T00:00:00.000Z");
    expect(calculatePurgeAt(now).toISOString()).toBe("2026-06-18T00:00:00.000Z");
  });
});

describe("progress localStorage module", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value)
      }
    });
  });

  it("stores viewed task and statuses", async () => {
    const progress = await import("@/lib/progress");
    progress.markViewed(10);
    progress.markAnswerOpened(10);
    progress.setTaskStatus(10, "REVIEW");
    const task = progress.getTaskProgress(10);
    expect(task?.status).toBe("REVIEW");
    expect(task?.answerOpened).toBe(true);
  });
});

describe("user auth and progress helpers", () => {
  it("validates registration and login payloads", () => {
    expect(registerSchema.safeParse({
      displayName: " Алиса ",
      email: "USER@EXAMPLE.COM",
      password: "password123",
      confirmPassword: "password123",
      acceptedTerms: true
    }).success).toBe(true);
    expect(registerSchema.safeParse({
      email: "bad",
      password: "password123",
      confirmPassword: "different",
      acceptedTerms: true
    }).success).toBe(false);
    expect(userLoginSchema.parse({ email: "USER@EXAMPLE.COM", password: "secret" }).email).toBe("user@example.com");
  });

  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("password123");
    expect(hash).not.toBe("password123");
    expect(await verifyPassword("password123", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("normalizes user task statuses", () => {
    expect(toUserTaskStatus("SOLVED")).toBe("SOLVED");
    expect(toUserTaskStatus("REVIEW")).toBe("REVIEW");
    expect(toUserTaskStatus("UNSEEN")).toBe("VIEWED");
  });
});
