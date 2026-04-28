"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin' | 'ambassador' | 'bronze' | 'silver' | 'vip' | 'gold';
  is_ambassador?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Persist the user's role in a separate short-lived cookie so that
 * api.ts can read it for client-side role guards WITHOUT needing React
 * context (api.ts is a module, not a component).
 *
 * The cookie is secondary/redundant — the JWT now also carries the role
 * claim.  It exists as a belt-and-suspenders fallback for sessions that
 * were created before the JWT was updated to carry role.
 */
function setRoleCookie(role: string) {
  Cookies.set('user_role', role, { expires: 7, sameSite: 'lax' });
}

function clearRoleCookie() {
  Cookies.remove('user_role');
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = Cookies.get('token');
    if (!token) {
      clearRoleCookie();
      setLoading(false);
      return;
    }

    try {
      const userData = await api.get<User>('/users/profile');
      // Map potential 'gold' role to 'vip' if backend returns old data
      if (userData.role === 'gold' as any) {
         userData.role = 'vip';
      }
      // Keep role cookie in sync so api.ts guards work correctly
      setRoleCookie(userData.role);
      setUser(userData);
    } catch (error: any) {
      // FE-RETRY-03 (Iter 9): Only remove the token on explicit auth failures
      // (401 Unauthorized / 403 Forbidden).  If the server was temporarily
      // unreachable (network error — no .status), the token is still valid;
      // removing it would silently log the user out on every server restart.
      //
      // By the time this catch fires, api.ts (FE-RETRY-01) has already retried
      // up to 3 times with exponential backoff, so this is a genuine failure.
      //
      // FE-14-01 (Iter 14): setUser(null) is also now guarded to auth failures
      // only.  A 500 (e.g. transient DB error) must not evict the user's session
      // state — the token is still valid and the server will recover.
      // On first load user is already null, so this is behaviorally identical
      // for that case; on mid-session errors it correctly preserves the session.
      const isAuthFailure = error?.status === 401 || error?.status === 403;
      if (isAuthFailure) {
        Cookies.remove('token');
        clearRoleCookie();
        setUser(null);
      }
      // Non-auth errors (5xx, network): leave user state as-is.
      // loading is still resolved to false in finally below.
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post<{
        user: User;
        session: { access_token: string };
      }>('/auth/login', { email, password }, { requiresAuth: false });

      const { user, session } = response;
      const token = session.access_token;

      // Map potential 'gold' role to 'vip'
      if (user.role === 'gold' as any) {
         user.role = 'vip';
      }

      // Store token in cookie
      Cookies.set('token', token, { expires: 7 });
      // Store role in cookie so api.ts guards work without decoding JWT
      setRoleCookie(user.role);

      setUser(user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const response = await api.post<{
        user: User;
        session: { access_token: string };
      }>('/auth/register', { email, password, firstName, lastName }, { requiresAuth: false });

      const { user, session } = response;
      const token = session.access_token;

      // Map potential 'gold' role to 'vip'
      if (user.role === 'gold' as any) {
         user.role = 'vip';
      }

      Cookies.set('token', token, { expires: 7 });
      setRoleCookie(user.role);

      setUser(user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
        // Optional: Call logout endpoint if your backend requires it
        // await api.post('/auth/logout', {});
    } catch (error) {
        console.error("Logout error", error);
    } finally {
        Cookies.remove('token');
        clearRoleCookie();
        setUser(null);
        router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
