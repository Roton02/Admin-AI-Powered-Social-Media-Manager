"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useAdminAuth } from "@/lib/auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.add({
        title: "Missing credentials",
        description: "Please enter your email/phone and password.",
        type: "error",
      });
      return;
    }
    setSubmitting(true);
    try {
      await login(identifier, password);
      toast.add({
        title: "Welcome back",
        description: "Signed in successfully.",
        type: "success",
      });
      router.push("/");
    } catch (err) {
      toast.add({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Could not sign in.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100">
        <CardHeader className="items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Pitret Admin
          </CardTitle>
          <CardDescription className="text-slate-400">
            Sign in with an administrator account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-slate-300">
                Email or Phone
              </Label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="admin@pitret.com"
                  className="pl-9 bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9 bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
