import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { SignOut } from "@/components/sign-out";
import { auth } from "@/lib/auth";
import { listDropsForOwner } from "@/lib/drops";
import { AgentAccess, type AgentKeySummary } from "@/components/agent-access";
export const dynamic="force-dynamic";
export const metadata: Metadata = { title: "Your chits", description: "Manage chits saved to your chit.md account." };
export default async function Dashboard({searchParams}:{searchParams:Promise<{deleted?:string}>}){const requestHeaders=await headers();const session=await auth.api.getSession({headers:requestHeaders});if(!session)return <><Nav/><main className="shell dashboard dashboard-public"><span className="route-label">Your chits</span><h1>Saved chits stay with your account.</h1><p>Sign in to see, edit, or delete chits you have kept. Account contents are private; agent setup and API documentation stay public.</p><div className="home-actions"><Link className="button-primary" href="/auth?next=/dashboard">Sign in</Link><Link className="button-secondary" href="/docs">Agent docs</Link></div></main></>;const [{deleted},drops,keyResult]=await Promise.all([searchParams,listDropsForOwner(session.user.id),auth.api.listApiKeys({headers:requestHeaders,query:{sortBy:"createdAt",sortDirection:"desc"}})]);const keys:AgentKeySummary[]=keyResult.apiKeys.map(key=>({id:key.id,name:key.name,start:key.start,createdAt:key.createdAt.toISOString(),lastRequest:key.lastRequest?.toISOString()||null}));return <><Nav/><main className="shell dashboard"><div className="dashboard-head"><div><h1>Your chits</h1><p>Signed in as {session.user.email}</p></div><SignOut/></div>
  {deleted==="1"&&<div className="notice success dashboard-notice" role="status">Chit deleted.</div>}
  {drops.length?<div className="drop-list">{drops.map(drop=><Link className="drop-row" href={`/dashboard/${drop.slug}`} key={drop.id}><div><h3>{drop.title}</h3><p>/{drop.slug} · {new Date(drop.created_at).toLocaleDateString()} · {drop.view_count} views</p></div><span className="badge">Edit</span></Link>)}</div>:<div className="empty chit-stack"><p>Nothing here yet.</p><p>New chits you make while signed in will show up here.</p><Link className="button-primary" href="/new">Make a chit</Link></div>}
  <AgentAccess initialKeys={keys}/>
  </main></>}
