import { homepageMarkdown } from "@/lib/public-content";
export function GET(){return new Response(homepageMarkdown(),{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=300"}})}
