import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

export function useSubscription() {
  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription'],
    queryFn: () => api.get<SubscriptionStatus>('/subscriptions/status'),
  });
}
