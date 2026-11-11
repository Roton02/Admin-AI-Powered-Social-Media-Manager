"use client";

import React, { useEffect, useState } from "react";
import {
  Edit3,
  Loader2,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface StripePlan {
  id: string;
  planType: string;
  amount: number;
  description: string;
  priceId: string;
  productId: string;
  feature: string[];
  active: boolean;
  currency: string;
  interval: string;
  createdAt: string;
}

interface PlanFormState {
  planType: string;
  description: string;
  amount: string;
  currency: string;
  interval: string;
  feature: string;
  active: boolean;
}

const EMPTY_FORM: PlanFormState = {
  planType: "",
  description: "",
  amount: "",
  currency: "usd",
  interval: "month",
  feature: "",
  active: true,
};

function parseFeatures(raw: string): string[] {
  return raw
    .split(/\r?\n|,/)
    .map((f) => f.trim())
    .filter(Boolean);
}

export default function PlansPage() {
  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StripePlan | null>(null);
  const [form, setForm] = useState<PlanFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get<StripePlan[]>("/payment/stripe-plans");
      setPlans(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.add({
        title: "Failed to load plans",
        description:
          err instanceof Error ? err.message : "Could not fetch plans.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreateDialog = () => {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (plan: StripePlan) => {
    setEditingPlan(plan);
    setForm({
      planType: plan.planType,
      description: plan.description,
      amount: String(plan.amount),
      currency: plan.currency,
      interval: plan.interval,
      feature: (plan.feature || []).join("\n"),
      active: plan.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.planType.trim() || !form.description.trim()) {
      toast.add({
        title: "Missing fields",
        description: "Plan type and description are required.",
        type: "error",
      });
      return;
    }
    if (Number.isNaN(amount) || amount < 0) {
      toast.add({
        title: "Invalid amount",
        description: "Amount must be a number equal to or greater than 0.",
        type: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const feature = parseFeatures(form.feature);
      if (editingPlan) {
        const body: Record<string, unknown> = {
          planType: form.planType.trim(),
          description: form.description.trim(),
          feature,
          active: form.active,
        };
        if (amount !== editingPlan.amount) body.amount = amount;
        if (form.currency.trim() !== editingPlan.currency)
          body.currency = form.currency.trim();
        if (form.interval !== editingPlan.interval) body.interval = form.interval;
        await api.patch(`/payment/update-plan/${editingPlan.id}`, body);
        toast.add({
          title: "Plan updated",
          description: `${form.planType} was updated.`,
          type: "success",
        });
      } else {
        await api.post("/payment/create/stripe-plan", {
          planType: form.planType.trim(),
          description: form.description.trim(),
          amount,
          currency: form.currency.trim() || "usd",
          interval: form.interval,
          feature,
        });
        toast.add({
          title: "Plan created",
          description: `${form.planType} was created in Stripe.`,
          type: "success",
        });
      }
      setDialogOpen(false);
      await loadPlans();
    } catch (err) {
      toast.add({
        title: editingPlan ? "Failed to update plan" : "Failed to create plan",
        description:
          err instanceof Error ? err.message : "Could not save the plan.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (plan: StripePlan) => {
    const confirmed = window.confirm(
      `Deactivate plan "${plan.planType}"? It will no longer be available.`
    );
    if (!confirmed) return;
    setBusyId(plan.id);
    try {
      await api.delete(`/payment/stripe-plan/${plan.id}`);
      toast.add({
        title: "Plan deleted",
        description: `${plan.planType} was deactivated.`,
        type: "success",
      });
      await loadPlans();
    } catch (err) {
      toast.add({
        title: "Failed to delete plan",
        description:
          err instanceof Error ? err.message : "Could not delete the plan.",
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
            Plan & Pricing Management
          </h1>
          <p className="text-slate-500">
            Define and update SaaS subscription tiers and their features.
          </p>
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700 gap-2"
          onClick={openCreateDialog}
        >
          <Plus size={18} />
          Create New Plan
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
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
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="py-12 text-center text-sm text-slate-500">
                    No plans found. Create your first plan.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-bold">{plan.planType}</TableCell>
                  <TableCell>
                    {plan.amount}{" "}
                    <span className="uppercase text-xs text-slate-500">
                      {plan.currency}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 capitalize">
                    {plan.interval}ly
                  </TableCell>
                  <TableCell>{plan.feature?.length ?? 0}</TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-xs truncate">
                    {plan.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={plan.active ? "default" : "destructive"}
                      className={cn(
                        "text-[10px]",
                        plan.active &&
                          "bg-green-100 text-green-700 border-green-200"
                      )}
                    >
                      {plan.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={busyId === plan.id}
                          />
                        }
                      >
                        {busyId === plan.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <MoreVertical size={16} />
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => openEditDialog(plan)}
                        >
                          <Edit3 size={14} />
                          Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-red-600"
                          onClick={() => deletePlan(plan)}
                        >
                          <Trash2 size={14} />
                          Delete Plan
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Plan" : "Create New Plan"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Update plan details. Pricing changes create a new Stripe price."
                : "Creates a Stripe product and price, then stores the plan."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="planType">Plan Type</Label>
                <Input
                  id="planType"
                  placeholder="e.g. Gold"
                  value={form.planType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, planType: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="10"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="usd"
                  value={form.currency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currency: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Billing Interval</Label>
                <select
                  id="interval"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.interval}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, interval: e.target.value }))
                  }
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
              <div className="space-y-2 flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-red-600"
                    checked={form.active}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, active: e.target.checked }))
                    }
                  />
                  Active
                </label>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="What this plan includes..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="feature">Features (one per line)</Label>
                <textarea
                  id="feature"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder={"Unified inbox\nAI automation\nCross-platform publishing"}
                  value={form.feature}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, feature: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingPlan ? "Save Changes" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
