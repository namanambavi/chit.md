import { Nav } from "@/components/nav";
import { ClaimPanel } from "@/components/claim-panel";
import { getDropByClaimToken, isDropExpired } from "@/lib/drops";
export const dynamic="force-dynamic";
export default async function ClaimPage({params}:{params:Promise<{token:string}>}){const {token}=await params;const drop=getDropByClaimToken(token);return <><Nav/><main className="auth-shell"><ClaimPanel token={token} title={drop?.title||"this page"} expired={isDropExpired(drop)} claimed={Boolean(drop?.owner_id)}/></main></>}
