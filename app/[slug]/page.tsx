import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { getDropBySlug, getDropOwnerName } from "@/lib/drops";
import { isExpiredChitSlug } from "@/lib/db";
import { CopyButton } from "@/components/copy-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ExpiryCountdown } from "@/components/expiry-countdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const drop = await getDropBySlug(slug);
  return drop ? { title: drop.title, description: `A chit passed through chit.md` } : await isExpiredChitSlug(slug) ? { title: "Chit expired" } : { title: "Page unavailable" };
}

export default async function DropPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const drop = await getDropBySlug(slug, true);
  if (!drop && await isExpiredChitSlug(slug)) return <main className="expired expired-chit"><div className="chit-stack"><span className="route-label">Expired</span><h1>This chit is gone.</h1><p>Its Markdown was deleted after 24 hours because nobody kept it.</p><Link className="button-primary" href="/new">Make a new chit</Link></div></main>;
  if (!drop) notFound();
  const ownerName = await getDropOwnerName(drop.owner_id);
  return <main className="page-wrap"><article className="doc-shell chit-stack reading-chit">
    <div className="doc-meta"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true"></span>chit.md</Link><div className="doc-actions">{drop.claimed_at || !drop.expires_at ? <span>Kept chit</span> : <ExpiryCountdown expiresAt={drop.expires_at}/>}<CopyButton value={drop.markdown}/><ThemeToggle/></div></div>
    {ownerName&&<p className="doc-byline">By {ownerName}</p>}
    <Markdown variant="rendered">{drop.markdown}</Markdown>
    <footer className="doc-cta"><div><strong>Make your own</strong><span>Start with Markdown.</span></div><Link className="button-primary" href="/new">New chit</Link></footer>
  </article></main>;
}
