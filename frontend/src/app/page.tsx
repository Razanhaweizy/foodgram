"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/validation/auth"; // or wherever your token helpers live

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasToken = !!getAccessToken();
    router.replace(hasToken ? "/me" : "/login");
  }, [router]);

  // Tiny placeholder while redirecting
  return <div className="p-6 text-[#667b68]">Loading…</div>;
}
