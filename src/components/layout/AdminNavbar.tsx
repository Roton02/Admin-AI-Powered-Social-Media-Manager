"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface NotificationRecipientItem {
  id: string;
  isRead: boolean;
}

interface MyNotificationsResult {
  notifications: NotificationRecipientItem[];
}

function initials(name?: string | null) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
  return letters.join("") || "A";
}

export function AdminNavbar() {
  const { user } = useAdminAuth();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get<MyNotificationsResult>(
          "/notifications?page=1&limit=50"
        );
        if (!cancelled) {
          setHasUnread(
            (res?.notifications || []).some((n) => n && n.isRead === false)
          );
        }
      } catch {
        // Navbar badge is best-effort only.
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Administration Console
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold border border-red-100">
          <ShieldCheck size={14} />
          Super Admin Mode
        </div>
        <Link
          href="/notifications"
          className="relative inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Link>
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        <Link href="/profile" className="flex items-center gap-3 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
              {user?.userName || "Admin"}
            </p>
            <p className="text-xs text-slate-500">{user?.email || user?.phone || ""}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
            {user?.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImage}
                alt={user?.userName || "Admin"}
                className="w-full h-full object-cover"
              />
            ) : (
              initials(user?.userName)
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
