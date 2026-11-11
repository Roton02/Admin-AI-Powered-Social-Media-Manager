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
import { cn } from "@/lib/utils";

interface AdminWorkspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  owner: {
    userName: string | null;
    email: string | null;
    phone: string | null;
  };
  plan: {
    planType: string;
    amount: number;
    interval: string;
  } | null;
  counts: {
    members: number;
    accounts: number;
    messages: number;
    posts: number;
  };
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<AdminWorkspace[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await api.get<AdminWorkspace[]>("/workspace/admin/all");
      setWorkspaces(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.add({
        title: "Failed to load workspaces",
        description:
          err instanceof Error ? err.message : "Could not fetch workspaces.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(search.toLowerCase()) ||
      ws.slug.toLowerCase().includes(search.toLowerCase()) ||
      (ws.owner?.userName ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Workspace Management
          </h1>
          <p className="text-slate-500">
            Oversee all business tenants and their configuration.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={loadWorkspaces}
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
            placeholder="Search by name, slug or owner..."
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-slate-500">
          {workspaces.length.toLocaleString()} workspaces
        </span>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workspace Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Accounts</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredWorkspaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <div className="py-12 text-center text-sm text-slate-500">
                    No workspaces found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkspaces.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell className="font-medium">{ws.name}</TableCell>
                  <TableCell className="text-sm text-slate-500 font-mono">
                    {ws.slug}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-700">
                      {ws.owner?.userName || "—"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {ws.owner?.email || ws.owner?.phone || ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ws.plan ? (
                      <Badge
                        variant="default"
                        className="text-[10px] bg-blue-600 text-white"
                      >
                        {ws.plan.planType}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Free
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{ws.counts?.members ?? 0}</TableCell>
                  <TableCell>{ws.counts?.accounts ?? 0}</TableCell>
                  <TableCell>{ws.counts?.messages ?? 0}</TableCell>
                  <TableCell>{ws.counts?.posts ?? 0}</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {ws.createdAt
                      ? new Date(ws.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
