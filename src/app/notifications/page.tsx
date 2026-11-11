"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface NotificationRecord {
  id: string;
  isRead: boolean;
  receivedAt: string;
  notification: {
    id: string;
    title: string;
    message: string;
    redirectEndpoint: string | null;
    createdAt: string;
  } | null;
}

interface MyNotificationsResult {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  notifications: NotificationRecord[];
}

const PAGE_SIZE = 10;

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [redirectEndpoint, setRedirectEndpoint] = useState("");
  const [audience, setAudience] = useState<"all" | "clients" | "technicians">(
    "all"
  );
  const [sending, setSending] = useState(false);

  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = React.useCallback(
    async (targetPage: number = page) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(PAGE_SIZE),
        });
        const res = await api.get<MyNotificationsResult>(
          `/notifications?${params.toString()}`
        );
        setItems(res?.notifications ?? []);
        setTotalCount(res?.totalCount ?? 0);
        setTotalPages(res?.totalPages ?? 0);
      } catch (err) {
        toast.add({
          title: "Failed to load notifications",
          description:
            err instanceof Error
              ? err.message
              : "Could not fetch notifications.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    loadNotifications(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.add({
        title: "Missing fields",
        description: "Title and message are required.",
        type: "error",
      });
      return;
    }
    setSending(true);
    try {
      const result = await api.post<{ recipientCount?: number }>(
        "/notifications",
        {
          title: title.trim(),
          message: message.trim(),
          audience,
          ...(redirectEndpoint.trim()
            ? { redirectEndpoint: redirectEndpoint.trim() }
            : {}),
        }
      );
      toast.add({
        title: "Notification broadcast",
        description: `Sent to ${result?.recipientCount ?? 0} recipient(s).`,
        type: "success",
      });
      setTitle("");
      setMessage("");
      setRedirectEndpoint("");
      setAudience("all");
      await loadNotifications(page);
    } catch (err) {
      toast.add({
        title: "Failed to send notification",
        description:
          err instanceof Error ? err.message : "Could not send notification.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch("/notifications/read-all");
      toast.add({
        title: "All caught up",
        description: "Every notification was marked as read.",
        type: "success",
      });
      await loadNotifications(page);
    } catch (err) {
      toast.add({
        title: "Failed to mark all as read",
        description:
          err instanceof Error ? err.message : "Could not update notifications.",
        type: "error",
      });
    } finally {
      setMarkingAll(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.add({
        title: "Failed to mark as read",
        description:
          err instanceof Error ? err.message : "Could not update notification.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="text-slate-500">
            Broadcast announcements to users and review your own notification
            feed.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={18} className="text-slate-400" />
            Broadcast Notification
          </CardTitle>
          <CardDescription>
            Send a notification to every active user in the selected audience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Scheduled maintenance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <select
                  id="audience"
                  className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={audience}
                  onChange={(e) =>
                    setAudience(
                      e.target.value as "all" | "clients" | "technicians"
                    )
                  }
                >
                  <option value="all">All users</option>
                  <option value="clients">Clients only</option>
                  <option value="technicians">Technicians only</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Write the announcement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="redirectEndpoint">
                Redirect Endpoint (optional)
              </Label>
              <Input
                id="redirectEndpoint"
                placeholder="e.g. /inbox or /posts"
                value={redirectEndpoint}
                onChange={(e) => setRedirectEndpoint(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {sending ? "Sending..." : "Send Notification"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-8">
        <h2 className="text-xl font-semibold text-slate-900">
          My Notifications
        </h2>
        <Button
          variant="outline"
          className="gap-2"
          onClick={markAllAsRead}
          disabled={markingAll || loading || items.every((n) => n.isRead)}
        >
          {markingAll ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle2 size={16} />
          )}
          Mark all as read
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Redirect</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-12 text-center text-sm text-slate-500">
                    No notifications yet.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((n) => (
                <TableRow key={n.id} className={!n.isRead ? "bg-blue-50/30" : ""}>
                  <TableCell className="font-medium text-sm">
                    {n.notification?.title || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                    {n.notification?.message || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {n.notification?.redirectEndpoint || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={n.isRead ? "outline" : "default"}
                      className="text-[10px]"
                    >
                      {n.isRead ? "Read" : "Unread"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {n.receivedAt
                      ? new Date(n.receivedAt).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => markAsRead(n.id)}
                      >
                        <CheckCircle2 size={14} />
                        Mark read
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {totalCount.toLocaleString()} notifications — Page{" "}
          {totalPages === 0 ? 0 : page} of {totalPages}
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
