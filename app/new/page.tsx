import { headers } from "next/headers";
import { Nav } from "@/components/nav";
import { NewDropForm } from "@/components/new-drop-form";
import { auth } from "@/lib/auth";
export const dynamic="force-dynamic";
export default async function NewPage(){const session=await auth.api.getSession({headers:await headers()});return <><Nav/><main className="shell compose-shell"><NewDropForm initialUser={session?{name:session.user.name}:null}/></main></>}
