'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { setAuthToken, setOnUnauthorized } from '@/lib/api';

export interface AdminUser {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // In-memory state only
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<AdminUser | null>(null);

  const logout = useCallback(() => {
    setTokenState(null);
    setUserState(null);
    setAuthToken(null);
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const login = useCallback((newToken: string, newUser: AdminUser) => {
    setTokenState(newToken);
    setUserState(newUser);
    setAuthToken(newToken);
  }, []);

  useEffect(() => {
    // Register global 401 unauth handler
    setOnUnauthorized(() => {
      logout();
    });
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
