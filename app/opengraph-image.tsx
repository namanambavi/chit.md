import { ImageResponse } from "next/og";
import { SocialCard } from "@/lib/brand-images";

export const alt = "chit.md — Markdown, on a link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<SocialCard title="Write it. Send the link."/>, size);
}
