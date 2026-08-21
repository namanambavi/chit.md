"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@heroui/react";
import { safeInternalPath } from "@/lib/navigation";

export function AuthForm() {
  const [mode, setMode] = useState<"sign-in"|"sign-up">("sign-in");
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const router=useRouter(); const search=useSearchParams(); const next=safeInternalPath(search.get("next"));
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");const form=new FormData(event.currentTarget);const email=String(form.get("email"));const password=String(form.get("password"));
    try{const result=mode==="sign-up" ? await authClient.signUp.email({name:String(form.get("name")),email,password}) : await authClient.signIn.email({email,password});
      if(result.error)throw new Error(result.error.message || "Authentication failed.");router.push(next);router.refresh();
    }catch(reason){setError(reason instanceof Error?reason.message:"Authentication failed. Please try again.")}finally{setBusy(false)}
  }
  return <div className="auth-card chit-stack"><span className="route-label">Your account</span><h1>{mode==="sign-in"?"Sign in":"Create an account"}</h1><p>{mode==="sign-in"?"Find and edit your chits.":"New chits will be saved here automatically."}</p>
    <form className="form-stack" onSubmit={submit}>
      {mode==="sign-up"&&<label><span>Name</span><input className="field" name="name" required maxLength={80} placeholder="Your name" autoComplete="name"/></label>}
      <label><span>Email</span><input className="field" name="email" required type="email" placeholder="you@example.com" autoComplete="email"/></label>
      <label><span>Password</span><input className="field" name="password" required type="password" minLength={8} maxLength={128} placeholder="At least 8 characters" autoComplete={mode==="sign-in"?"current-password":"new-password"}/></label>
      {error&&<div className="notice error">{error}</div>}
      <Button className="button-primary" type="submit" isDisabled={busy}>{busy?(mode==="sign-in"?"Signing in…":"Creating account…"):mode==="sign-in"?"Sign in":"Create account"}</Button>
    </form>
    <div className="auth-switch">{mode==="sign-in"?"New here? ":"Already have an account? "}<button onClick={()=>{setMode(mode==="sign-in"?"sign-up":"sign-in");setError("")}}>{mode==="sign-in"?"Create an account":"Sign in"}</button></div>
  </div>
}
