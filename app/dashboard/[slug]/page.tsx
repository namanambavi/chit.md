import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { DropEditor } from "@/components/drop-editor";
import { auth } from "@/lib/auth";
import { getOwnedDrop } from "@/lib/drops";
export const dynamic="force-dynamic";
export default async function ManagePage({params}:{params:Promise<{slug:string}>}){const session=await auth.api.getSession({headers:await headers()});if(!session)redirect("/auth");const {slug}=await params;const drop=await getOwnedDrop(slug,session.user.id);if(!drop)notFound();return <><Nav/><main className="shell manage-grid"><DropEditor slug={drop.slug} title={drop.title} markdown={drop.markdown}/></main></>}
