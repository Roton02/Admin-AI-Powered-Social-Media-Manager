"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AdminUserRow {
  id: string;
  userName: string | null;
  email: string | null;
  profileImage: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
}

interface UsersResult {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  users: AdminUserRow[];
}

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await api.get<UsersResult>(`/users?${params.toString()}`);
      setUsers(res?.users ?? []);
      setTotalCount(res?.totalCount ?? 0);
      setTotalPages(res?.totalPages ?? 0);
    } catch (err) {
      toast.add({
        title: "Failed to load users",
        description:
          err instanceof Error ? err.message : "Could not fetch user list.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleStatus = async (user: AdminUserRow) => {
    const nextStatus = user.status === "Blocked" ? "Active" : "Blocked";
    setBusyId(user.id);
    try {
      await api.patch(`/users/${user.id}/status`, { status: nextStatus });
      toast.add({
        title: "Status updated",
        description: `${user.userName || user.email || "User"} is now ${nextStatus}.`,
        type: "success",
      });
      await loadUsers();
    } catch (err) {
      toast.add({
        title: "Failed to update status",
        description:
          err instanceof Error ? err.message : "Could not update user status.",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (user: AdminUserRow) => {
    const confirmed = window.confirm(
      `Delete ${user.userName || user.email || "this user"}? This cannot be undone.`
    );
    if (!confirmed) return;
    setBusyId(user.id);
    try {
      await api.delete(`/users/delete-user/${user.id}`);
      toast.add({
        title: "User deleted",
        description: `${user.userName || user.email || "User"} was removed.`,
        type: "success",
      });
      if (users.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadUsers();
      }
    } catch (err) {
      toast.add({
        title: "Failed to delete user",
        description:
          err instanceof Error ? err.message : "Could not delete user.",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="text-slate-500">
            Manage all registered users and their account statuses.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            placeholder="Search by user name..."
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-slate-500">
          {totalCount.toLocaleString()} total users
        </span>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="py-12 text-center text-sm text-slate-500">
                    No users found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.userName || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {user.email || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {user.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "Active" ? "default" : "destructive"
                      }
                      className={cn(
                        "text-[10px]",
                        user.status === "Active" &&
                          "bg-green-100 text-green-700 border-green-200"
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={busyId === user.id}
                          />
                        }
                      >
                        {busyId === user.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <MoreVertical size={16} />
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className={cn(
                            "gap-2",
                            user.status === "Blocked"
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                          onClick={() => toggleStatus(user)}
                        >
                          {user.status === "Blocked" ? (
                            <UserCheck size={14} />
                          ) : (
                            <ShieldAlert size={14} />
                          )}
                          {user.status === "Blocked"
                            ? "Unblock User"
                            : "Block User"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-red-600"
                          onClick={() => deleteUser(user)}
                        >
                          <Trash2 size={14} />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {totalPages === 0 ? 0 : page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
