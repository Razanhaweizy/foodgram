"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, clearTokens } from "@/lib/validation/auth"; // adjust path if needed

type User = {
  username: string;
  email: string;
  is_admin?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // bootstrap user on mount if access token exists
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetch("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUser(data);
        })
        .catch(() => {
          clearTokens();
          setUser(null);
        });
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
