import Cookies from 'js-cookie';
import { toast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/env';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  skipErrorHandling?: boolean;
  requiresAuth?: boolean;
}

export const api = {
  get: async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    return fetchWithAuth<T>(endpoint, { ...options, method: 'GET' });
  },
  post: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
    const isFormData = body instanceof FormData;
    return fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  put: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
    const isFormData = body instanceof FormData;
    return fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  patch: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
    const isFormData = body instanceof FormData;
    return fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  delete: async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    return fetchWithAuth<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

/**
 * Shared error-shape helper for toasts. Falls back through the common error
 * shapes our backend + fetch layer produce.
 */
export const describeError = (err: unknown): string => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { message?: unknown; statusText?: unknown };
    if (typeof anyErr.message === 'string') return anyErr.message;
    if (typeof anyErr.statusText === 'string') return anyErr.statusText;
  }
  return 'Unexpected error';
};

async function fetchWithAuth<T>(endpoint: string, options: FetchOptions): Promise<T> {
  const token = Cookies.get('token');
  const requiresAuth = options.requiresAuth !== false;

  if (requiresAuth && !token) {
    const error = new Error('Authorization header missing') as any;
    error.status = 401;
    throw error;
  }

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const { skipErrorHandling, ...fetchOptions } = options;

  const config = {
    ...fetchOptions,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        // Parse error message if available
        let errorMessage = 'An error occurred';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            errorMessage = response.statusText;
        }

        const error = new Error(errorMessage) as any;
        error.status = response.status;
        throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error: any) {
    console.error(`API Error [${options.method} ${endpoint}]:`, error);

    // Skip showing toast if unauthenticated access is generally expected to fail (401/403) unless overridden
    const isAuthError = error.status === 401 || error.status === 403;

    if (!skipErrorHandling && !isAuthError) {
      toast({
        title: "Request failed",
        description: describeError(error),
        variant: "destructive",
      });
    }

    throw error;
  }
}
