import { headers } from "next/headers";
import { AnalyticsIdentity } from "@/components/analytics-identity";
import { NewDropForm } from "@/components/new-drop-form";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <main className="compose-shell">
    <AnalyticsIdentity />
    <NewDropForm initialUser={session ? { name: session.user.name } : null} />
  </main>;
}
