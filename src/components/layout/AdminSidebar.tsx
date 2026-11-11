"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/config/navigation";
import { useAdminAuth } from "@/lib/auth-context";
import { toast } from "@/components/ui/toast";

function initials(name?: string | null) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
  return letters.join("") || "A";
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    toast.add({
      title: "Signed out",
      description: "Your admin session has ended.",
      type: "info",
    });
    router.push("/login");
  };

  return (
    <aside className="flex flex-col w-64 h-screen bg-slate-950 text-slate-400 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
          A
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          Pitret Admin
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = Icons[item.icon as keyof typeof Icons] as
            | React.ComponentType<{ size?: number }>
            | undefined;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                isActive
                  ? "bg-red-600 text-white"
                  : "hover:bg-slate-900 hover:text-white"
              )}
            >
              {Icon && <Icon size={18} />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-slate-900/50">
          <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-medium">
            {initials(user?.userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.userName || "Admin"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || user?.phone || ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <Icons.LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
