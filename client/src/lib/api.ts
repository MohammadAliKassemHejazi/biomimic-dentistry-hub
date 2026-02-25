import Cookies from 'js-cookie';
import { toast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  skipErrorHandling?: boolean;
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

async function fetchWithAuth<T>(endpoint: string, options: FetchOptions): Promise<T> {
  const token = Cookies.get('token');

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
        } catch (e) {
            errorMessage = response.statusText;
        }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error: any) {
    console.error(`API Error [${options.method} ${endpoint}]:`, error);

    if (!skipErrorHandling) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }

    throw error;
  }
}
