// MOCK SUPABASE CLIENT
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        order: async (column?: string, options?: { ascending?: boolean }) => ({ data: null, error: null }),
      }),
      order: async (column?: string, options?: { ascending?: boolean }) => ({ data: null, error: null }),
    }),
    update: (data: any) => ({
      eq: async (column: string, value: any) => ({ data: null, error: null }),
    }),
  }),
  rpc: async () => ({ data: null, error: null }),
  functions: {
    invoke: async (functionName?: string, options?: any) => ({ data: { url: 'https://example.com' } as any, error: null }),
  },
};
