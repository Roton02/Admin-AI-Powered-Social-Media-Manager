"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CreditCard,
  FileText,
  Loader2,
  Send,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface OverviewKpi {
  label: string;
  value: number;
  delta: string;
  up: boolean;
}

interface AdminOverviewResult {
  from?: string;
  to?: string;
  kpis?: OverviewKpi[];
  totals?: {
    totalWorkspaces: number;
    activeSubscriptions: number;
    totalPosts: number;
    publishedPosts: number;
  };
}

interface TotalEarningsResult {
  totalAmount: number;
}

const KPI_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Total Workspaces": Building2,
  "Active Subscriptions": CreditCard,
  "Total Posts": FileText,
  "Published Posts": Send,
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverviewResult | null>(null);
  const [earnings, setEarnings] = useState<TotalEarningsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [overviewRes, earningsRes] = await Promise.all([
          api.get<AdminOverviewResult>("/users/admin-overview"),
          api.get<TotalEarningsResult>("/payment/total-earnings"),
        ]);
        if (!cancelled) {
          setOverview(overviewRes);
          setEarnings(earningsRes);
        }
      } catch (err) {
        toast.add({
          title: "Failed to load overview",
          description:
            err instanceof Error ? err.message : "Could not load dashboard data.",
          type: "error",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  const kpis = overview?.kpis ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            System Overview
          </h1>
          <p className="text-slate-500">
            Real-time health and metrics of the Pitret SaaS platform.
          </p>
          {overview?.from && overview?.to && (
            <p className="text-xs text-slate-400 mt-1">
              Reporting window: {overview.from} — {overview.to}
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 gap-1"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live Data
        </Badge>
      </div>

      {kpis.length === 0 && !earnings ? (
        <Card>
          <CardContent className="p-10 text-center text-slate-500">
            No overview data available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi) => {
            const Icon = KPI_ICONS[kpi.label] ?? Activity;
            return (
              <StatCard
                key={kpi.label}
                title={kpi.label}
                value={Number(kpi.value).toLocaleString()}
                icon={<Icon className="text-slate-600" />}
                trend={kpi.delta}
                trendUp={kpi.up}
              />
            );
          })}
          <Card className="overflow-hidden bg-slate-900 text-white border-none">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">
                  Total Earnings
                </span>
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Wallet className="text-green-400" size={18} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <span className="text-3xl font-bold">
                {usd.format(earnings?.totalAmount ?? 0)}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                Collected via Stripe invoices (amount paid).
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500">{title}</span>
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{value}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {trendUp ? (
            <ArrowUpRight size={14} className="text-green-500" />
          ) : (
            <ArrowDownRight size={14} className="text-red-500" />
          )}
          <span
            className={cn(
              "text-xs",
              trendUp ? "text-green-600" : "text-red-600"
            )}
          >
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
