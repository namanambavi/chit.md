import { Nav } from "@/components/nav";
import { Markdown } from "@/components/markdown";
import { docsMarkdown } from "@/lib/docs-content";
import { CopyButton } from "@/components/copy-button";
export default function Docs(){return <><Nav/><main className="doc-shell docs-shell chit-stack"><div className="doc-meta"><span>Pass chits from any agent · v1</span><div className="doc-actions"><a href="/skill.md">Raw instructions</a><CopyButton value={docsMarkdown}/></div></div><Markdown variant="rendered">{docsMarkdown}</Markdown></main></>}
