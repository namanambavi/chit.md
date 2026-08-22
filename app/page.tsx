import Link from "next/link";
import { headers } from "next/headers";
import { Nav } from "@/components/nav";
import { auth } from "@/lib/auth";
import { agentReadinessCopy, softwareApplicationJsonLd } from "@/lib/public-content";

/*
THESIS: chit.md turns a file handoff into the familiar act of passing one crisp note; it refuses both generic SaaS cards and nostalgic paper cosplay.
OWN-WORLD: True white and charcoal, Inter, quiet controls, precise sheet edges, and a two-layer offset stack used only at handoff moments.
STORY: See a Markdown chit become a clean link, make one immediately, or give the same capability to an agent.
FIRST VIEWPORT: The promise and actions sit beside a large stacked chit containing the real rendered result; the foreground page remains perfectly flat and readable.
FORM: User-approved composition C—offset stack topology with a pristine reading sheet and minimal dispatch metadata.
*/

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  return <><Nav/><main className="home-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(softwareApplicationJsonLd()).replace(/</g,"\\u003c")}}/>
    <section className="home-hero">
      <div className="home-copy">
        <span className="home-kicker">{session ? `Signed in as ${session.user.name}` : "Markdown, on a link"}</span>
        <h1>{session ? "Make a chit. It stays here." : "Write it. Send the link."}</h1>
        <p>{session ? "Every chit you publish is saved to your account." : "Paste Markdown. Share one link with people or agents."}</p>
        <div className="home-actions"><Link className="button-primary button-large" href="/new">New chit</Link><Link className="button-secondary button-large" href={session?"/dashboard":"/docs"}>{session?"Your chits":"Use with an agent"}</Link></div>
        <span className="home-note">{session ? "No claim link. No expiry." : "No account? The link lasts 24 hours. Sign in to keep it."}</span>
      </div>

      <div className="chit-stack handoff-stack"><div className="handoff-demo" aria-label="Markdown publishing example">
        <div className="handoff-top"><span>chit.md/a7kx9q</span><span className="status-dot">Ready</span></div>
        <article>
          <h2>Tuesday launch</h2>
          <p>Ship the smaller onboarding flow first.</p>
          <h3>Before we send it</h3>
          <ul><li>Confirm the copy</li><li>Check the mobile flow</li><li>Share the final link</li></ul>
        </article>
        <div className="handoff-bottom"><span>Public link</span><span>Markdown available</span></div>
      </div></div>
    </section>

    <section className="home-flow" aria-label="How chit.md works">
      <div><strong>Paste</strong><span>Start with Markdown.</span></div>
      <div><strong>Send</strong><span>Share one URL.</span></div>
      <div><strong>Keep</strong><span>Sign in and every new chit is saved.</span></div>
    </section>
    <section className="home-agent-readiness" aria-labelledby="agent-ready-heading">
      <div><span className="home-kicker">Built for a handoff</span><h2 id="agent-ready-heading">{agentReadinessCopy.heading}</h2><p>{agentReadinessCopy.intro}</p></div>
      <div className="home-agent-details"><p>{agentReadinessCopy.anonymous}</p><p>{agentReadinessCopy.account}</p><p>{agentReadinessCopy.agents} <Link href="/docs">Read the agent docs.</Link></p></div>
    </section>
  </main></>;
}
