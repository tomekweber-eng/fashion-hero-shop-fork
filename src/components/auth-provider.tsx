"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import posthog from "posthog-js";

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "stepforward_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
        try {
          posthog.identify(parsed.email);
        } catch {
          // posthog not initialized yet
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // Mock login — always succeeds
    const newUser: User = {
      email,
      firstName: email.split("@")[0],
      lastName: "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    try {
      posthog.identify(email);
    } catch {
      // posthog not initialized
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const newUser: User = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    try {
      posthog.identify(data.email);
    } catch {
      // posthog not initialized
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    try {
      posthog.reset();
    } catch {
      // posthog not initialized
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
