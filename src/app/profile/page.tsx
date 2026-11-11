"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Mail, MapPin, Phone, Save, User } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { AdminUser, useAdminAuth } from "@/lib/auth-context";

function initials(name?: string | null) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
  return letters.join("") || "A";
}

export default function AdminProfilePage() {
  const { user, refreshProfile } = useAdminAuth();
  const [profile, setProfile] = useState<AdminUser | null>(user);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const applyProfile = (p: AdminUser) => {
    setProfile(p);
    setUserName(p.userName ?? "");
    setEmail(p.email ?? "");
    setPhone(p.phone ?? "");
    setAddress(p.address ?? "");
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get<AdminUser>("/auth/profile");
      applyProfile(res);
    } catch (err) {
      toast.add({
        title: "Failed to load profile",
        description:
          err instanceof Error ? err.message : "Could not fetch profile.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/set-profile", {
        userName: userName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      toast.add({
        title: "Profile updated",
        description: "Your profile was saved successfully.",
        type: "success",
      });
      await Promise.all([loadProfile(), refreshProfile()]);
    } catch (err) {
      toast.add({
        title: "Failed to update profile",
        description:
          err instanceof Error ? err.message : "Could not update profile.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Admin Profile
        </h1>
        <p className="text-slate-500">
          Manage your personal administrative account details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                {profile?.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profileImage}
                    alt={profile.userName || "Admin"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-slate-400">
                    {initials(profile?.userName)}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {profile?.userName || "Admin"}
                </h2>
                <p className="text-sm text-slate-500">
                  {profile?.email || profile?.phone || ""}
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-red-600 border-red-200 bg-red-50 text-xs"
              >
                {profile?.role || "Admin"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status:</span>
                <span className="font-medium text-slate-700">
                  {profile?.status || "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Role:</span>
                <span className="font-medium text-slate-700">
                  {profile?.role || "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Account ID:</span>
                <span className="font-mono font-medium text-slate-700">
                  {profile?.id ? `${profile.id.slice(0, 10)}…` : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} className="text-slate-400" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your admin account details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="flex items-center gap-1">
                      <User size={14} className="text-slate-400" />
                      Full Name
                    </Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <Mail size={14} className="text-slate-400" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <Phone size={14} className="text-slate-400" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-1">
                      <MapPin size={14} className="text-slate-400" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="City, Country"
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
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
