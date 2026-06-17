import katex from "katex";

export function Formula({ latex, block = true }: { latex: string; block?: boolean }) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: block,
    output: "htmlAndMathml"
  });
  return (
    <div
      className={block ? "math-scroll rounded-md bg-slate-50 p-4 text-lg" : "inline"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
