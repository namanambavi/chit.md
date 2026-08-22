import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { SignOut } from "@/components/sign-out";
import { auth } from "@/lib/auth";
import { listDropsForOwner } from "@/lib/drops";
import { AgentAccess, type AgentKeySummary } from "@/components/agent-access";
export const dynamic="force-dynamic";
export default async function Dashboard(){const requestHeaders=await headers();const session=await auth.api.getSession({headers:requestHeaders});if(!session)redirect("/auth?next=/dashboard");const [drops,keyResult]=await Promise.all([listDropsForOwner(session.user.id),auth.api.listApiKeys({headers:requestHeaders,query:{sortBy:"createdAt",sortDirection:"desc"}})]);const keys:AgentKeySummary[]=keyResult.apiKeys.map(key=>({id:key.id,name:key.name,start:key.start,createdAt:key.createdAt.toISOString(),lastRequest:key.lastRequest?.toISOString()||null}));return <><Nav/><main className="shell dashboard"><div className="dashboard-head"><div><h1>Your chits</h1><p>Signed in as {session.user.email}</p></div><SignOut/></div>
  {drops.length?<div className="drop-list">{drops.map(drop=><Link className="drop-row" href={`/dashboard/${drop.slug}`} key={drop.id}><div><h3>{drop.title}</h3><p>/{drop.slug} · {new Date(drop.created_at).toLocaleDateString()} · {drop.view_count} views</p></div><span className="badge">Edit</span></Link>)}</div>:<div className="empty chit-stack"><p>Nothing here yet.</p><p>New chits you make while signed in will show up here.</p><Link className="button-primary" href="/new">Make a chit</Link></div>}
  <AgentAccess initialKeys={keys}/>
  </main></>}
