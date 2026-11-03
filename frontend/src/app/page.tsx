"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGuestUser } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getGuestUser();
    if (user) {
      router.replace("/chat");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
      Loading Generative UI Studio...
    </div>
  );
}
