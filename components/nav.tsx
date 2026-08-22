import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnalyticsIdentity } from "@/components/analytics-identity";

export function Nav() {
  return <header className="nav-wrap">
    <div className="shell nav">
      <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true"></span>chit.md</Link>
      <nav className="nav-links" aria-label="Primary navigation">
        <Link href="/new">New chit</Link>
        <Link href="/dashboard">Pages</Link>
        <Link href="/docs">Agents</Link>
        <ThemeToggle />
      </nav>
      <AnalyticsIdentity />
    </div>
  </header>;
}
