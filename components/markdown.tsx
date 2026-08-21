import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

export function Markdown({ children, variant = "source" }: { children: string; variant?: "source" | "rendered" }) {
  return <div className={`markdown markdown-${variant}`}><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeHighlight]}>{children}</ReactMarkdown></div>;
}
