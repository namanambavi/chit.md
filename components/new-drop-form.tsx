"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { MarkdownEditor } from "@/components/markdown-editor";
import { authClient } from "@/lib/auth-client";
import { captureClientEvent } from "@/lib/analytics-client";

type Published = {url:string;markdown_url:string;claim_url:string|null;expires_at:string|null;owned:boolean;owner:{name:string}|null};

export function NewDropForm({initialUser}:{initialUser:{name:string}|null}){const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [published,setPublished]=useState<Published|null>(null);
  const {data:session}=authClient.useSession();
  const account=session?.user||initialUser;
  const [copied,setCopied]=useState("");
  const [markdown,setMarkdown]=useState("# Quick note\n\nHere’s what I wanted to share.\n\n## Details\n\nAdd the useful context here.");
  useEffect(()=>captureClientEvent("composer_opened",{signed_in:Boolean(account)}),[account]);
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");const form=new FormData(event.currentTarget);try{const response=await fetch("/api/v1/drops",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:form.get("title")||undefined,markdown,source:"web"})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not publish this page.");setPublished(data)}catch(reason){setError(reason instanceof Error?reason.message:"Could not publish this page.")}finally{setBusy(false)}}
  async function copy(value:string,type:"public"|"markdown"|"keep"){try{await navigator.clipboard.writeText(value);setCopied(value);setError("");captureClientEvent("link_copied",{link_type:type});window.setTimeout(()=>setCopied(current=>current===value?"":current),1600)}catch{setError("Could not copy this link. Select it and copy it manually.")}}
  if(published)return <section className="publish-result chit-stack passed-chit"><span className="route-label">{published.owned?"Saved to your account":"Ready to share"}</span><h1>Your chit is live.</h1><p>{published.owned?"Send the link. You can edit it later from Your chits.":"Send the public link. Use the private link if you decide to keep it."}</p>
    <div className="capability-list"><div><span>Public link</span><Link href={published.url}>{published.url}</Link><Button className="button-secondary" onClick={()=>copy(published.url,"public")}>{copied===published.url?"Copied":"Copy"}</Button></div>{published.owned?<div><span>Markdown</span><Link href={published.markdown_url}>{published.markdown_url}</Link><Button className="button-secondary" onClick={()=>copy(published.markdown_url,"markdown")}>{copied===published.markdown_url?"Copied":"Copy"}</Button></div>:published.claim_url&&<div><span>Private keep link</span><code>{published.claim_url}</code><Button className="button-secondary" onClick={()=>copy(published.claim_url!,"keep")}>{copied===published.claim_url?"Copied":"Copy"}</Button></div>}</div>
    {error&&<div className="notice error" role="alert">{error}</div>}
    <div className="form-row"><span className="form-note">{published.owned?"Saved. It won’t expire.":`Expires ${new Date(published.expires_at!).toLocaleString()} unless you keep it.`}</span><div className="editor-actions">{published.owned&&<Link className="button-secondary" href="/dashboard">Your chits</Link>}<Link className="button-primary" href={published.url}>Open chit</Link></div></div></section>;
  return <form className="composer" onSubmit={submit}><div className="composer-head"><div className="composer-context"><Link className="composer-back" href="/" aria-label="Back to chit.md"><span aria-hidden="true">←</span><span className="composer-back-label">chit.md</span></Link><label className="title-field"><span className="visually-hidden">Title (optional)</span><input name="title" maxLength={120} placeholder="Untitled chit"/></label><span className="composer-owner">{account?`Saving to ${account.name}`:"Not signed in · 24h"}</span></div><div className="composer-actions"><Button className="button-primary" type="submit" isDisabled={busy||!markdown.trim()}>{busy?"Publishing…":"Make a chit"}</Button></div></div>
    <MarkdownEditor value={markdown} onChange={setMarkdown}/>
    {error&&<div className="notice error">{error}</div>}
  </form>}
