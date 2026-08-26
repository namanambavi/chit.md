import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "chit.md — Markdown, on a link", template: "%s — chit.md" },
  description: "Publish Markdown as a clean public URL for people and agents.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  applicationName: "chit.md",
  openGraph: {
    type: "website",
    siteName: "chit.md",
    title: "chit.md — Markdown, on a link",
    description: "Publish Markdown as a clean public URL for people and agents.",
  },
  twitter: {
    card: "summary_large_image",
    title: "chit.md — Markdown, on a link",
    description: "Publish Markdown as a clean public URL for people and agents.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `(function(){try{var saved=localStorage.getItem('chit-theme')||localStorage.getItem('said-theme');var theme=saved==='light'||saved==='dark'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch(e){}})()`;
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><head><link rel="alternate" type="text/plain" href="/llms.txt"/><link rel="alternate" type="text/markdown" href="/skill.md"/><link rel="alternate" type="application/json" href="/.well-known/agent.json"/><script dangerouslySetInnerHTML={{__html:themeScript}}/></head><body>{children}</body></html>;
}
