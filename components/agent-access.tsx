"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { captureClientEvent } from "@/lib/analytics-client";

export type AgentKeySummary = {
  id: string;
  name: string | null;
  start: string | null;
  createdAt: string;
  lastRequest: string | null;
};

export function AgentAccess({ initialKeys }: { initialKeys: AgentKeySummary[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState("My agent");
  const [newKey, setNewKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function createKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNewKey("");
    const result = await authClient.apiKey.create({ name: name.trim() });
    if (result.error || !result.data) {
      setError(result.error?.message || "Could not create this key."); setBusy(false); return;
    }
    setNewKey(result.data.key);
    setKeys(current => [{
      id: result.data.id,
      name: result.data.name,
      start: result.data.start,
      createdAt: new Date(result.data.createdAt).toISOString(),
      lastRequest: null,
    }, ...current]);
    setCopied(false); setBusy(false); captureClientEvent("agent_key_created");
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(newKey); setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { setError("Could not copy the key. Select it and copy it manually."); }
  }

  async function revoke(keyId: string) {
    setBusy(true); setError("");
    const result = await authClient.apiKey.delete({ keyId });
    if (result.error) setError(result.error.message || "Could not revoke this key.");
    else { setKeys(current => current.filter(key => key.id !== keyId)); captureClientEvent("agent_key_revoked"); }
    setBusy(false);
  }

  return <section className="agent-access" aria-labelledby="agent-access-title">
    <div className="section-head"><div><h2 id="agent-access-title">Agent access</h2><p>Give an agent its own key. Chits it makes will appear in this account.</p></div><Link href="/docs">Setup guide</Link></div>
    {newKey && <div className="key-reveal" role="status"><strong>Copy this key now</strong><p>It won’t be shown again.</p><div><code>{newKey}</code><Button className="button-secondary" onClick={copyKey}>{copied ? "Copied" : "Copy"}</Button></div><code className="env-example">CHIT_API_KEY={newKey}</code></div>}
    <form className="key-create" onSubmit={createKey}><label><span>Key name</span><input className="field" value={name} onChange={event => setName(event.target.value)} required minLength={1} maxLength={32} placeholder="Claude on my Mac"/></label><Button className="button-primary" type="submit" isDisabled={busy || !name.trim()}>{busy ? "Working…" : "Create key"}</Button></form>
    {error && <div className="notice error" role="alert">{error}</div>}
    {keys.length > 0 && <div className="key-list">{keys.map(key => <div className="key-row" key={key.id}><div><strong>{key.name || "Agent key"}</strong><span><code>{key.start || "chit_live_…"}</code> · {key.lastRequest ? `Last used ${new Date(key.lastRequest).toLocaleDateString()}` : "Never used"}</span></div><Button className="button-secondary button-danger" onClick={() => revoke(key.id)} isDisabled={busy}>Revoke</Button></div>)}</div>}
  </section>;
}
