import { Difficulty, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const taskInputSchema = z.object({
  number: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  categoryId: z.string().min(1),
  difficulty: z.nativeEnum(Difficulty),
  conditionMarkdown: z.string().min(1).max(10000),
  expressionLatex: z.string().min(1).max(5000),
  answerMarkdown: z.string().min(1).max(10000),
  solutionMarkdown: z.string().min(1).max(30000),
  source: z.string().max(500).optional().nullable(),
  status: z.nativeEnum(TaskStatus),
  images: z.array(z.object({
    id: z.string().optional(),
    altText: z.string().max(300).optional().nullable(),
    sortOrder: z.coerce.number().int().min(0).default(0)
  })).optional()
});

export const categoryInputSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1).max(1000),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true)
});

export const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1)
});
