import katex from "katex";

export type MathBlock = {
  raw: string;
  formula: string;
};

const mathPattern = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;

export function extractMathBlocks(markdown: string): MathBlock[] {
  const blocks: MathBlock[] = [];
  for (const match of markdown.matchAll(mathPattern)) {
    const formula = match[1] ?? match[2] ?? match[3] ?? match[4] ?? "";
    blocks.push({ raw: match[0], formula });
  }
  return blocks;
}

export function validateLatex(formula: string): string | null {
  try {
    katex.renderToString(formula, { throwOnError: true, output: "htmlAndMathml" });
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Некорректная формула LaTeX";
  }
}

export function validateMarkdownMath(markdown: string): Array<{ fragment: string; message: string }> {
  return extractMathBlocks(markdown).flatMap((block) => {
    const error = validateLatex(block.formula);
    return error ? [{ fragment: block.raw, message: error }] : [];
  });
}
