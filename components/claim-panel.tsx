"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@heroui/react";
import { captureClientEvent } from "@/lib/analytics-client";

export function ClaimPanel({token,title,expired,claimed}:{token:string;title:string;expired:boolean;claimed:boolean}){
  const {data:session,isPending}=authClient.useSession();const router=useRouter();const [state,setState]=useState<"idle"|"claiming"|"error">("idle");const [error,setError]=useState("");
  async function claim(){setState("claiming");setError("");captureClientEvent("claim_started");try{const response=await fetch("/api/v1/claims",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Couldn’t keep this chit.");router.replace(`/dashboard?claimed=${data.slug}`);router.refresh()}catch(reason){setError(reason instanceof Error?reason.message:"Couldn’t keep this chit.");setState("error")}}
  if(expired)return <div className="auth-card chit-stack"><h1>This link expired.</h1><p>The chit was deleted after 24 hours because nobody kept it.</p><Link className="button-primary" href="/new">Make a new chit</Link></div>;
  if(claimed)return <div className="auth-card chit-stack"><h1>This chit is already saved.</h1><p>It belongs to another account.</p></div>;
  if(isPending||state==="claiming")return <div className="auth-card chit-stack"><h1>Saving “{title}”</h1><p>Adding it to your account…</p></div>;
  if(state==="error")return <div className="auth-card chit-stack"><h1>Couldn’t save this chit.</h1><div className="notice error" role="alert">{error}</div><Button className="button-secondary" onClick={claim}>Try again</Button></div>;
  if(!session)return <div className="auth-card chit-stack"><h1>Keep “{title}”</h1><p>Sign in first. We’ll bring you back here.</p><Link className="button-primary" href={`/auth?next=${encodeURIComponent(`/claim/${token}`)}`}>Sign in to keep it</Link></div>;
  return <div className="auth-card chit-stack"><h1>Keep “{title}”</h1><p>Save it to {session.user.email}. It won’t expire.</p><Button className="button-primary" onClick={claim}>Keep this chit</Button></div>;
}
