'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { setAuthToken, getAuthToken, setOnUnauthorized } from '@/lib/api';

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
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

function getUserFromCookie(): AdminUser | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )askara_admin_user=([^;]*)/);
  if (match && match[1]) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      return null;
    }
  }
  return null;
}

function setUserCookie(user: AdminUser | null, days = 7) {
  if (typeof document === 'undefined') return;
  if (user) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `askara_admin_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } else {
    document.cookie = 'askara_admin_user=; path=/; max-age=0; SameSite=Lax';
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from pure Cookies on mount
  useEffect(() => {
    try {
      const savedToken = getAuthToken();
      if (savedToken) {
        setTokenState(savedToken);
        setAuthToken(savedToken);
        const savedUser = getUserFromCookie();
        setUserState(savedUser || { name: 'Administrator' });
      }
    } catch (e) {
      console.warn('Failed to load auth from cookies:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
    setUserState(null);
    setAuthToken(null);
    setUserCookie(null);
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const login = useCallback((newToken: string, newUser: AdminUser) => {
    setTokenState(newToken);
    setUserState(newUser);
    setAuthToken(newToken);
    setUserCookie(newUser);
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
        isLoading,
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
