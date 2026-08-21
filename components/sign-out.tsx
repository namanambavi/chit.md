"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
export function SignOut(){const router=useRouter();return <Button className="button-secondary" onClick={async()=>{await authClient.signOut();router.push("/");router.refresh()}}>Sign out</Button>}
