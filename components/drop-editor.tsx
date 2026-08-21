"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { MarkdownEditor } from "@/components/markdown-editor";

export function DropEditor({slug,title,markdown}:{slug:string;title:string;markdown:string}){const [state,setState]=useState<"idle"|"saving"|"saved"|"error">("idle");const [error,setError]=useState("");const [content,setContent]=useState(markdown);
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setState("saving");setError("");const form=new FormData(event.currentTarget);try{const response=await fetch(`/api/v1/drops/${slug}/manage`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({title:form.get("title"),markdown:content})});const data=await response.json().catch(()=>({}));if(response.ok)setState("saved");else{setError(data.error||"Could not save changes.");setState("error")}}catch{setError("Changes could not be saved. Check your connection and try again.");setState("error")}}
  return <form className="composer" onSubmit={submit}><div className="composer-head"><span className="route-label">Editing /{slug}</span><div className="editor-actions"><Link className="button-secondary" href={`/${slug}`}>View chit</Link><Button className="button-primary" type="submit" isDisabled={state==="saving"}>{state==="saving"?"Saving…":"Save changes"}</Button></div></div>
    <label className="title-field"><span>Chit title</span><input name="title" required maxLength={120} defaultValue={title}/></label><MarkdownEditor value={content} onChange={(next)=>{setContent(next);if(state==="saved")setState("idle")}}/><div className="composer-foot"><span className="form-note">{state==="saved"?"Saved":"Changes update the same link."}</span></div>{state==="saved"&&<div className="notice success">Chit updated.</div>}{state==="error"&&<div className="notice error">{error}</div>}</form>}
