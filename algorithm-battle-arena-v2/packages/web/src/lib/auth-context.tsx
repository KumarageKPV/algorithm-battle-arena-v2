"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { getToken, setToken, clearToken } from "@/lib/tokenStorage";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

interface JwtPayload {
  email: string;
  role: string;
  studentId?: number;
  teacherId?: number;
  exp: number;
}

interface AuthUser {
  email: string;
  role: string;
  studentId?: number;
  teacherId?: number;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<string>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeUser(token: string): (AuthUser & { exp: number }) | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    return {
      email: payload.email,
      role: payload.role,
      studentId: payload.studentId,
      teacherId: payload.teacherId,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = getToken();
    if (stored) {
      const decoded = decodeUser(stored);
      if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
        setTokenState(stored);
        setUser(decoded);
      } else {
        clearToken();
      }
    }
    setIsLoading(false);
  }, []);

  // Listen for cross-tab and same-tab token changes
  useEffect(() => {
    const handler = () => {
      const stored = getToken();
      if (stored) {
        setTokenState(stored);
        setUser(decodeUser(stored));
      } else {
        setTokenState(null);
        setUser(null);
      }
    };
    window.addEventListener("token-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("token-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string> => {
    const res = await authApi.login(email, password);
    const { token: newToken, role } = res.data;
    setToken(newToken);
    setTokenState(newToken);
    setUser(decodeUser(newToken));
    return role;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

