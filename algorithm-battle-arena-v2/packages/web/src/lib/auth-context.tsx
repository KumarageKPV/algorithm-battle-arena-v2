"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate user from the backend profile (cookie-based auth)
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        // Try to get token from localStorage
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          setTokenState(storedToken);
        }
        
        const res = await authApi.getProfile();
        if (!isMounted) return;
        const data = res.data as any;
        setUser({
          email: data.email,
          role: data.role,
          studentId: data.role === "Student" ? data.id : undefined,
          teacherId: data.role === "Teacher" ? data.id : undefined,
        });
      } catch {
        if (!isMounted) return;
        setUser(null);
        setTokenState(null);
        localStorage.removeItem('auth_token');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string> => {
    const res = await authApi.login(email, password);
    const role = res.data.role;
    const jwtToken = res.data.token; // Get token from response
    
    // Store token in localStorage for persistence
    if (jwtToken) {
      localStorage.setItem('auth_token', jwtToken);
    }
    
    try {
      const profile = await authApi.getProfile();
      const data = profile.data as any;
      setUser({
        email: data.email,
        role: data.role,
        studentId: data.role === "Student" ? data.id : undefined,
        teacherId: data.role === "Teacher" ? data.id : undefined,
      });
      setTokenState(jwtToken);
    } catch {
      setUser(null);
      setTokenState(null);
    }
    return role;
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => undefined);
    setTokenState(null);
    setUser(null);
    localStorage.removeItem('auth_token');
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
