import { ImageResponse } from "next/og";
import { SocialCard } from "@/lib/brand-images";
import { getDropBySlug } from "@/lib/drops";

export const alt = "A public Markdown chit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ChitOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  return new ImageResponse(
    <SocialCard title={drop?.title || "A public Markdown chit"} label="Passed through chit.md"/>,
    size,
  );
}
