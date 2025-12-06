import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'user' | 'vip' | 'ambassador' | 'admin';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>('user');
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole('user');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_role', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching role:', error);
        setRole('user');
      } else {
        setRole((data as AppRole) || 'user');
      }
    } catch (error) {
      console.error('Error in fetchRole:', error);
      setRole('user');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

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
    refreshRole: fetchRole
  };
};
