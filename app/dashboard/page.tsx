import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { SignOut } from "@/components/sign-out";
import { auth } from "@/lib/auth";
import { listDropsForOwner } from "@/lib/drops";
export const dynamic="force-dynamic";
export default async function Dashboard(){const session=await auth.api.getSession({headers:await headers()});if(!session)redirect("/auth?next=/dashboard");const drops=await listDropsForOwner(session.user.id);return <><Nav/><main className="shell dashboard"><div className="dashboard-head"><div><h1>Your chits</h1><p>Signed in as {session.user.email}</p></div><SignOut/></div>
  {drops.length?<div className="drop-list">{drops.map(drop=><Link className="drop-row" href={`/dashboard/${drop.slug}`} key={drop.id}><div><h3>{drop.title}</h3><p>/{drop.slug} · {new Date(drop.created_at).toLocaleDateString()} · {drop.view_count} views</p></div><span className="badge">Edit</span></Link>)}</div>:<div className="empty chit-stack"><p>Nothing here yet.</p><p>New chits you make while signed in will show up here.</p><Link className="button-primary" href="/new">Make a chit</Link></div>}
  </main></>}
