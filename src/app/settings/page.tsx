"use client";

import React, { useState } from "react";
import { KeyRound, Loader2, Shield } from "lucide-react";
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
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";

export default function AdminSettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.add({
        title: "Missing fields",
        description: "Current and new password are required.",
        type: "error",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast.add({
        title: "Password too short",
        description: "New password must be at least 6 characters.",
        type: "error",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.add({
        title: "Passwords do not match",
        description: "Please confirm your new password.",
        type: "error",
      });
      return;
    }
    setSaving(true);
    try {
      await api.patch("/auth/change-password", { oldPassword, newPassword });
      toast.add({
        title: "Password changed",
        description: "Your admin password has been updated.",
        type: "success",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.add({
        title: "Failed to change password",
        description:
          err instanceof Error ? err.message : "Could not change password.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Admin Settings
        </h1>
        <p className="text-slate-500">
          Manage security for your administrator account.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={18} className="text-slate-400" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update the password for your admin account. The change applies
            immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <KeyRound size={16} />
              )}
              {saving ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
