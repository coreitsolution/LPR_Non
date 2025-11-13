// Config
import { getUrls } from '../config/runtimeConfig';

export interface FetchOptions extends RequestInit {
  queryParams?: Record<string, string>;
  skipAuth?: boolean;
  isFormData?: boolean;
  isService1?: boolean;
  isStream?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } 
    else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Separate refresh token API call
const refreshTokenRequest = async (): Promise<{ accessToken: string }> => {
  const { CENTER_API } = getUrls();
  try {
    const response = await fetch(`${CENTER_API}/users/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Failed to refresh token: ${errorDetails}`);
    }

    return response.json();
  } 
  catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem('token');
    localStorage.removeItem("userId");
    throw error;
  }
};

// Helper function to handle authentication errors
const handleAuthError = async () => {
  if (!isRefreshing) {
    isRefreshing = true;
    try {
      const result = await refreshTokenRequest();
      const newToken = result.accessToken;
      localStorage.setItem('token', newToken);
      
      isRefreshing = false;
      processQueue(null, newToken);
      return newToken;
    } 
    catch (error) {
      processQueue(error, undefined);
      isRefreshing = false;
      throw error;
    }
  } 
  else {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({
        resolve,
        reject,
      });
    });
  }
};

export const fetchClient = async <T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { queryParams, ...fetchOptions } = options;

  const executeRequest = async (token?: string): Promise<T> => {
    try {
      const headers: HeadersInit = {
        ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && !options.skipAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      const queryString = queryParams
        ? "?" + new URLSearchParams(queryParams).toString()
        : "";

      const response = await fetch(`${endpoint}${queryString}`, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        if ((response.status === 401 || response.status === 403) && !endpoint.includes("login")) {
          // Try to refresh the token and retry the request
          const newToken = await handleAuthError();
          return executeRequest(newToken);
        }
        const errorText = await response.text();
        const error = new Error(errorText || response.statusText);
        (error as any).status = response.status;
        throw error;
      }

      return response.json();
    } 
    catch (error) {
      console.error('Fetch error:', error);
      
      // Check if it's a CORS error (TypeError or NetworkError)
      if (error instanceof TypeError || 
          (error instanceof Error && error.message.includes('NetworkError'))) {

        if (!options.skipAuth && localStorage.getItem('token')) {
          console.warn('Network error on authenticated request - redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem("userId");
          window.location.href = '/login';
        }
      }
      
      throw error;
    }
  };

  const initialToken = localStorage.getItem('token') || undefined;
  return executeRequest(initialToken);
};

export const combineURL = (url: string, endpoint: string) => {
  return `${url}${endpoint}`;
};