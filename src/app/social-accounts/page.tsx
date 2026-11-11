"use client";

import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";

interface AdminSocialAccount {
  id: string;
  workspaceId: string;
  platform: string;
  accountName: string;
  tokenExpiry: string | null;
  createdAt: string;
  workspace: {
    name: string;
    slug: string;
  } | null;
}

function formatExpiry(tokenExpiry: string | null): {
  label: string;
  expired: boolean;
} {
  if (!tokenExpiry) return { label: "No expiry", expired: false };
  const date = new Date(tokenExpiry);
  return {
    label: date.toLocaleDateString(),
    expired: date.getTime() < Date.now(),
  };
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<AdminSocialAccount[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get<AdminSocialAccount[]>(
        "/social/accounts/admin/all"
      );
      setAccounts(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.add({
        title: "Failed to load social accounts",
        description:
          err instanceof Error
            ? err.message
            : "Could not fetch social accounts.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const filteredAccounts = accounts.filter((acc) => {
    const q = search.toLowerCase();
    return (
      (acc.workspace?.name ?? "").toLowerCase().includes(q) ||
      acc.accountName.toLowerCase().includes(q) ||
      acc.platform.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Social Accounts Overview
          </h1>
          <p className="text-slate-500">
            Monitor all connected social accounts across all workspaces.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={loadAccounts}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            placeholder="Search by workspace, account or platform..."
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-slate-500">
          {accounts.length.toLocaleString()} connected accounts
        </span>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>Token Status</TableHead>
              <TableHead>Token Expiry</TableHead>
              <TableHead>Connected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-12 text-center text-sm text-slate-500">
                    No social accounts found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((acc) => {
                const expiry = formatExpiry(acc.tokenExpiry);
                return (
                  <TableRow key={acc.id}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {acc.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {acc.accountName}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-700">
                        {acc.workspace?.name || "—"}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {acc.workspace?.slug || ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={expiry.expired ? "destructive" : "outline"}
                        className={
                          expiry.expired
                            ? "text-[10px]"
                            : "text-[10px] text-green-600 border-green-200 bg-green-50"
                        }
                      >
                        {expiry.expired ? "Expired" : "Connected"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {expiry.label}
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {acc.createdAt
                        ? new Date(acc.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
