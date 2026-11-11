"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
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

interface AdminSubscription {
  id: string;
  planType: string;
  status: string;
  paymentMethodId: string;
  interval: string;
  priceId: string;
  price: number | null;
  subscriptionId: string;
  createdAt: string;
  user: {
    id: string;
    userName: string | null;
    email: string | null;
  } | null;
}

interface SubscriptionsResult {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  subscriptions: AdminSubscription[];
}

const PAGE_SIZE = 10;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      const res = await api.get<SubscriptionsResult>(
        `/payment/subscriptions?${params.toString()}`
      );
      setSubscriptions(res?.subscriptions ?? []);
      setTotalCount(res?.totalCount ?? 0);
      setTotalPages(res?.totalPages ?? 0);
    } catch (err) {
      toast.add({
        title: "Failed to load subscriptions",
        description:
          err instanceof Error ? err.message : "Could not fetch subscriptions.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const filteredSubs = subscriptions.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.user?.userName ?? "").toLowerCase().includes(q) ||
      (s.user?.email ?? "").toLowerCase().includes(q) ||
      s.planType.toLowerCase().includes(q) ||
      s.subscriptionId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Subscription Management
          </h1>
          <p className="text-slate-500">
            Manage workspace subscriptions and billing cycles.
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
            placeholder="Search by user, plan or subscription ID..."
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-slate-500">
          {totalCount.toLocaleString()} total subscriptions
        </span>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stripe Subscription</TableHead>
              <TableHead>Started</TableHead>
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
            ) : filteredSubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="py-12 text-center text-sm text-slate-500">
                    No subscriptions found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSubs.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-700">
                      {sub.user?.userName || "—"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {sub.user?.email || ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {sub.planType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 capitalize">
                    per {sub.interval}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {sub.price != null ? usd.format(sub.price) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sub.status === "ACTIVE"
                          ? "default"
                          : sub.status === "EXPIRED"
                            ? "destructive"
                            : "outline"
                      }
                      className={cn(
                        "text-[10px]",
                        sub.status === "ACTIVE" &&
                          "bg-green-100 text-green-700 border-green-200"
                      )}
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {sub.subscriptionId}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {sub.createdAt
                      ? new Date(sub.createdAt).toLocaleDateString()
                      : "—"}
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
