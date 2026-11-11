"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/config/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 h-screen bg-slate-900 text-slate-300 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          P
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          Pitret SaaS
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = Icons[item.icon as keyof typeof Icons];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 hover:text-white",
              )}
            >
              {Icon &&
                React.createElement(Icon as React.ElementType, { size: 18 })}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-white">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">John Doe</p>
            <p className="text-xs text-slate-500 truncate">Admin Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
