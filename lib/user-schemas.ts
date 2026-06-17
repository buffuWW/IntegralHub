import { UserTaskStatus } from "@prisma/client";
import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email();

export const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional().or(z.literal("").transform(() => undefined)),
  email: emailSchema,
  password: z.string().min(8).max(72),
  confirmPassword: z.string().min(8).max(72),
  acceptedTerms: z.boolean()
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Пароли не совпадают"
}).refine((value) => value.acceptedTerms, {
  path: ["acceptedTerms"],
  message: "Нужно согласиться с правилами использования"
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72)
});

export const progressUpdateSchema = z.object({
  status: z.nativeEnum(UserTaskStatus).optional(),
  answerOpened: z.boolean().optional(),
  solutionOpened: z.boolean().optional(),
  incrementViewCount: z.boolean().optional()
});

export const progressImportSchema = z.object({
  tasks: z.record(z.string(), z.object({
    status: z.enum(["VIEWED", "SOLVED", "REVIEW", "UNSEEN"]).optional(),
    firstViewedAt: z.string().datetime().optional(),
    lastViewedAt: z.string().datetime().optional(),
    statusChangedAt: z.string().datetime().optional(),
    viewCount: z.number().int().min(0).max(100000).optional(),
    answerOpened: z.boolean().optional(),
    solutionOpened: z.boolean().optional()
  })).refine((tasks) => Object.keys(tasks).length <= 2000, "Не более 2000 записей за импорт")
});
