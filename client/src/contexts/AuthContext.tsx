"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin' | 'ambassador' | 'bronze' | 'silver' | 'vip';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = Cookies.get('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Assuming backend returns user object with 'role'
      const userData = await api.get<User>('/users/profile');
      // Map potential 'gold' role to 'vip' if backend returns old data
      if (userData.role === 'gold' as any) {
         userData.role = 'vip';
      }
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      Cookies.remove('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post<{
        user: User;
        session: { access_token: string };
      }>('/auth/login', {
        email,
        password,
      });

      const { user, session } = response;
      const token = session.access_token;

      // Map potential 'gold' role to 'vip'
      if (user.role === 'gold' as any) {
         user.role = 'vip';
      }

      // Store token in cookie
      Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
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
      }>(
        '/auth/register',
        { email, password, firstName, lastName }
      );

      const { user, session } = response;
      const token = session.access_token;

      // Map potential 'gold' role to 'vip'
      if (user.role === 'gold' as any) {
         user.role = 'vip';
      }

      Cookies.set('token', token, { expires: 7 });
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
