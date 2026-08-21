import { Suspense } from "react";
import { Nav } from "@/components/nav";
import { AuthForm } from "@/components/auth-form";
import { authFeatures } from "@/lib/auth";
export const dynamic="force-dynamic";
export default function AuthPage(){return <><Nav/><main className="auth-shell"><Suspense fallback={<div className="auth-card">Loading…</div>}><AuthForm {...authFeatures}/></Suspense></main></>}
