import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

function surface(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname === "/new") return "composer";
  if (pathname === "/auth") return "auth";
  if (pathname === "/docs" || pathname === "/skill.md" || pathname === "/openapi.json") return "agents";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname.startsWith("/dashboard/")) return "editor";
  if (pathname.startsWith("/claim/")) return "claim";
  if (pathname.split("/").filter(Boolean).length === 1) return "chit";
  return "other";
}

function captureSurface(pathname: string, navigation: "load" | "client") {
  posthog.capture("surface_viewed", { surface: surface(pathname), navigation });
}

if (token && host) {
  posthog.init(token, {
    api_host: host,
    defaults: "2026-05-30",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    disable_surveys: true,
    person_profiles: "identified_only",
    persistence: "localStorage",
    tracing_headers: [window.location.hostname],
    loaded: () => captureSurface(window.location.pathname, "load"),
  });
}

export function onRouterTransitionStart(url: string) {
  if (!token || !host) return;
  try { captureSurface(new URL(url, window.location.origin).pathname, "client"); } catch { /* analytics never blocks navigation */ }
}
