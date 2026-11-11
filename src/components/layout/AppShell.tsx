"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/lib/auth-context";
import { AdminMainLayout } from "./AdminMainLayout";

function FullPageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, loading } = useAdminAuth();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!isLoginPage && !loading && !token) {
      router.replace("/login");
    }
    if (isLoginPage && !loading && token) {
      router.replace("/");
    }
  }, [isLoginPage, loading, token, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return <FullPageSpinner />;
  }

  if (!token) {
    return <FullPageSpinner />;
  }

  return <AdminMainLayout>{children}</AdminMainLayout>;
}
