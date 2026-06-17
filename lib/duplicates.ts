import crypto from "node:crypto";

function normalizeText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizeLatex(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

export function computeDuplicateHash(input: {
  categoryId: string;
  conditionMarkdown: string;
  expressionLatex: string;
  answerMarkdown: string;
}): string {
  const source = [
    input.categoryId,
    normalizeText(input.conditionMarkdown),
    normalizeLatex(input.expressionLatex),
    normalizeText(input.answerMarkdown)
  ].join("|");

  return crypto.createHash("sha256").update(source).digest("hex");
}
