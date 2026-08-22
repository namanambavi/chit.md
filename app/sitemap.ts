import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  return ["", "/new", "/docs", "/dashboard"].map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" }));
}
