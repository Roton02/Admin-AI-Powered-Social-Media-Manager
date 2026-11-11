"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
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
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PublishPlatform {
  platform: string;
  status: string;
  publishedAt: string | null;
  errorLog: string | null;
}

interface PublishJob {
  jobId: string;
  workspaceId: string;
  content: string;
  createdAt: string;
  platforms: PublishPlatform[];
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "text-green-700 border-green-200 bg-green-50",
  FAILED: "text-red-700 border-red-200 bg-red-50",
  PROCESSING: "text-blue-700 border-blue-200 bg-blue-50",
  PENDING: "text-slate-600 border-slate-200 bg-slate-50",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "PUBLISHED")
    return <CheckCircle2 size={14} className="text-green-600" />;
  if (status === "FAILED") return <XCircle size={14} className="text-red-600" />;
  if (status === "PROCESSING")
    return <RefreshCw size={14} className="text-blue-600 animate-spin" />;
  return <Clock size={14} className="text-slate-400" />;
}

function shortId(id: string) {
  if (!id) return "—";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

export default function PublishingMonitorPage() {
  const [jobs, setJobs] = useState<PublishJob[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get<PublishJob[]>("/publishing/admin/all");
      setJobs(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.add({
        title: "Failed to load publishing jobs",
        description:
          err instanceof Error ? err.message : "Could not fetch publishing data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.content.toLowerCase().includes(search.toLowerCase()) ||
      job.workspaceId.toLowerCase().includes(search.toLowerCase()) ||
      job.platforms.some((p) =>
        p.platform.toLowerCase().includes(search.toLowerCase())
      )
  );

  const publishedCount = jobs.reduce(
    (acc, job) =>
      acc + job.platforms.filter((p) => p.status === "PUBLISHED").length,
    0
  );
  const failedCount = jobs.reduce(
    (acc, job) => acc + job.platforms.filter((p) => p.status === "FAILED").length,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Publishing Monitor
          </h1>
          <p className="text-slate-500">
            Real-time tracking of content publishing jobs across all tenants.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={loadJobs}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="p-4">
            <p className="text-sm font-medium text-slate-500">Total Jobs</p>
            <div className="text-2xl font-bold mt-1">
              {loading ? "—" : jobs.length.toLocaleString()}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm font-medium text-slate-500">
              Published Platform Posts
            </p>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {loading ? "—" : publishedCount.toLocaleString()}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm font-medium text-slate-500">
              Failed Platform Posts
            </p>
            <div className="text-2xl font-bold mt-1 text-red-600">
              {loading ? "—" : failedCount.toLocaleString()}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            placeholder="Search by content, workspace or platform..."
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="py-12 text-center text-sm text-slate-500">
                    No publishing jobs found.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow key={job.jobId}>
                  <TableCell
                    className="max-w-xs truncate text-sm text-slate-600"
                    title={job.content}
                  >
                    {job.content}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {shortId(job.workspaceId)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {job.platforms.map((p) => (
                        <Badge
                          key={`${job.jobId}-${p.platform}`}
                          variant="outline"
                          className={cn(
                            "capitalize text-[10px] gap-1",
                            STATUS_STYLES[p.status] ?? STATUS_STYLES.PENDING
                          )}
                          title={p.errorLog || undefined}
                        >
                          <StatusIcon status={p.status} />
                          {p.platform}
                          {p.errorLog && (
                            <AlertCircle size={12} className="text-red-500" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleString()
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
