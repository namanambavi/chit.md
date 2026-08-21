import { z } from "zod";
import { limits } from "@/lib/config";

export const publishSchema = z.object({
  markdown: z.string().min(1).max(limits.markdownBytes),
  title: z.string().trim().min(1).max(limits.titleLength).optional(),
  source: z.string().trim().max(80).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
}).strict();

export const claimSchema = z.object({ token: z.string().min(20).max(200) });

export const updateDropSchema = z.object({
  title: z.string().trim().min(1).max(limits.titleLength),
  markdown: z.string().min(1).max(limits.markdownBytes),
}).strict();

export function titleFromMarkdown(markdown: string) {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return (heading || "Untitled chit").replace(/[*_`[\]]/g, "").slice(0, limits.titleLength);
}
