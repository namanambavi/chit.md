"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { safeInternalPath } from "@/lib/navigation";
import { captureClientEvent, identifyClientUser } from "@/lib/analytics-client";

type Mode = "sign-in" | "sign-up" | "forgot" | "reset";

export function AuthForm({ github, google, emailDelivery }: { github: boolean; google: boolean; emailDelivery: boolean }) {
  const search = useSearchParams();
  const token = search.get("token");
  const [mode, setMode] = useState<Mode>(token ? "reset" : "sign-in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const next = safeInternalPath(search.get("next"));

  function switchMode(nextMode: Mode) {
    setMode(nextMode); setError(""); setMessage("");
  }

  async function social(provider: "github" | "google") {
    setBusy(true); setError(""); captureClientEvent("auth_started", { provider });
    const result = await authClient.signIn.social({ provider, callbackURL: next });
    if (result?.error) { setError(result.error.message || "Could not sign in."); setBusy(false); }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    try {
      if (mode === "forgot") {
        const result = await authClient.requestPasswordReset({ email, redirectTo: "/auth?mode=reset" });
        if (result.error) throw new Error(result.error.message || "Could not send the reset link.");
        setMessage("If that email has an account, a reset link is on its way.");
        return;
      }
      if (mode === "reset") {
        if (!token) throw new Error("This reset link is missing its token.");
        if (password !== String(form.get("confirmPassword") || "")) throw new Error("Passwords do not match.");
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) throw new Error(result.error.message || "Could not reset the password.");
        setMessage("Password changed. You can sign in now."); setMode("sign-in");
        return;
      }
      const result = mode === "sign-up"
        ? await authClient.signUp.email({ name: String(form.get("name")), email, password, callbackURL: next })
        : await authClient.signIn.email({ email, password, callbackURL: next });
      if (result.error) throw new Error(result.error.message || "Could not sign in.");
      if (mode === "sign-up" && emailDelivery) { setMessage("Check your email to finish creating the account."); return; }
      if (result.data?.user?.id) identifyClientUser(result.data.user.id);
      captureClientEvent("auth_completed", { provider: "email", mode });
      router.push(next); router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  const title = mode === "sign-up" ? "Create an account" : mode === "forgot" ? "Reset your password" : mode === "reset" ? "Choose a new password" : "Sign in";
  const intro = mode === "sign-up" ? "Every new chit will be saved here." : mode === "forgot" ? "We’ll email you a reset link." : mode === "reset" ? "Use at least eight characters." : "Find and edit your chits.";
  const submitLabel = mode === "sign-up" ? "Create account" : mode === "forgot" ? "Send reset link" : mode === "reset" ? "Save new password" : "Sign in";

  return <div className="auth-card chit-stack">
    <span className="route-label">Your account</span><h1>{title}</h1><p>{intro}</p>
    {(github || google) && mode !== "forgot" && mode !== "reset" && <div className="social-auth">
      {google && <Button className="button-secondary social-button" type="button" isDisabled={busy} onPress={() => social("google")}><GoogleIcon/>Continue with Google</Button>}
      {github && <Button className="button-secondary social-button" type="button" isDisabled={busy} onPress={() => social("github")}><GitHubIcon/>Continue with GitHub</Button>}
      <div className="auth-divider"><span>or</span></div>
    </div>}
    <form className="form-stack" onSubmit={submit}>
      {mode === "sign-up" && <label><span>Name</span><input className="field" name="name" required maxLength={80} placeholder="Your name" autoComplete="name"/></label>}
      {mode !== "reset" && <label><span>Email</span><input className="field" name="email" required type="email" placeholder="you@example.com" autoComplete="email"/></label>}
      {mode !== "forgot" && <label><span>Password</span><input className="field" name="password" required type="password" minLength={8} maxLength={128} placeholder="At least 8 characters" autoComplete={mode === "sign-in" ? "current-password" : "new-password"}/></label>}
      {mode === "reset" && <label><span>Confirm password</span><input className="field" name="confirmPassword" required type="password" minLength={8} maxLength={128} placeholder="Repeat your password" autoComplete="new-password"/></label>}
      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice success">{message}</div>}
      <Button className="button-primary" type="submit" isDisabled={busy}>{busy ? "Working…" : submitLabel}</Button>
    </form>
    <div className="auth-switch">
      {mode === "sign-in" && <><button onClick={() => switchMode("forgot")} disabled={!emailDelivery}>Forgot password?</button><span> · </span><button onClick={() => switchMode("sign-up")}>Create account</button></>}
      {mode !== "sign-in" && <button onClick={() => switchMode("sign-in")}>Back to sign in</button>}
    </div>
  </div>;
}

function GoogleIcon() {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.613Z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.182l-2.91-2.258c-.806.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.715H.956v2.333A9 9 0 0 0 9 18Z"/>
    <path fill="#FBBC05" d="M3.963 10.705A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.168.281-1.705V4.962H.956A9 9 0 0 0 0 9c0 1.452.347 2.826.956 4.038l3.007-2.333Z"/>
    <path fill="#EA4335" d="M9 3.58c1.322 0 2.508.454 3.441 1.345l2.581-2.581C13.463.891 11.425 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.333C4.672 5.165 6.656 3.58 9 3.58Z"/>
  </svg>;
}
function GitHubIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82c.85 0 1.7.11 2.5.34 1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg> }
