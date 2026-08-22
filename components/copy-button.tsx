"use client";

import { useState } from "react";
import { captureClientEvent } from "@/lib/analytics-client";

export function CopyButton({ value, label = "Copy Markdown" }: { value: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      captureClientEvent("markdown_copied");
      window.setTimeout(() => setState("idle"), 1600);
    } catch { setState("error"); }
  }

  const accessibleLabel = state === "copied" ? "Copied" : state === "error" ? "Copy failed. Try again" : label;
  return <button className="icon-button copy-button" type="button" aria-label={accessibleLabel} title={accessibleLabel} onClick={copy} data-state={state}>
    {state === "copied" ? <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg> : <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>}
  </button>;
}
