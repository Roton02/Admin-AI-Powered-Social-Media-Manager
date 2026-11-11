"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, clearToken, getToken, setToken } from "@/lib/api";

export interface AdminUser {
  id: string;
  userName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  profileImage?: string | null;
  role: string;
  status?: string;
}

interface AdminLoginResult {
  accessToken: string;
  id: string;
  role: string;
  userName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  profileImage?: string | null;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (activeToken: string) => {
    try {
      const profile = await api.get<AdminUser>("/auth/profile", {
        token: activeToken,
      });
      if (!profile || profile.role !== "Admin") {
        clearToken();
        setTokenState(null);
        setUser(null);
        return;
      }
      setUser(profile);
    } catch {
      clearToken();
      setTokenState(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const existing = getToken();
    if (!existing) {
      setLoading(false);
      return;
    }
    setTokenState(existing);
    fetchProfile(existing).finally(() => setLoading(false));
  }, [fetchProfile]);

  const login = useCallback(async (emailOrPhone: string, password: string) => {
    const identifier = emailOrPhone.trim();
    const result = await api.post<AdminLoginResult>(
      "/auth/admin-login",
      identifier.includes("@")
        ? { email: identifier, password }
        : { phone: identifier, password },
      { token: null }
    );
    setToken(result.accessToken);
    setTokenState(result.accessToken);
    setUser({
      id: result.id,
      role: result.role,
      userName: result.userName,
      email: result.email,
      phone: result.phone,
      address: result.address,
      profileImage: result.profileImage,
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const activeToken = getToken();
    if (!activeToken) return;
    await fetchProfile(activeToken);
  }, [fetchProfile]);

  return (
    <AdminAuthContext.Provider
      value={{ user, token, loading, login, logout, refreshProfile }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
