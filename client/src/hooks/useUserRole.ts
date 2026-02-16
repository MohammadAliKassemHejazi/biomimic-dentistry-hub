import { useState, useCallback } from 'react';

export type AppRole = 'user' | 'vip' | 'ambassador' | 'admin';

export const useUserRole = () => {
  // MOCK: Always return 'admin' to test all UI, or 'user'.
  // Let's default to 'admin' so we can verify the dashboard fully.
  const [role, setRole] = useState<AppRole>('admin');
  const [loading, setLoading] = useState(false);

  const hasRole = useCallback((requiredRole: AppRole): boolean => {
    const roleHierarchy: Record<AppRole, number> = {
      'user': 1,
      'vip': 2,
      'ambassador': 3,
      'admin': 4
    };
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  }, [role]);

  const isAdmin = role === 'admin';
  const isAmbassador = role === 'ambassador' || role === 'admin';
  const isVip = role === 'vip' || role === 'ambassador' || role === 'admin';

  return {
    role,
    loading,
    hasRole,
    isAdmin,
    isAmbassador,
    isVip,
    refreshRole: () => {}
  };
};
