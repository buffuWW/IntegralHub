import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeSanitize from "rehype-sanitize";
import remarkMath from "remark-math";

export function SafeMarkdown({ content }: { content: string }) {
  return (
    <div className="prose-safe math-scroll text-slate-800">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeSanitize, rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
