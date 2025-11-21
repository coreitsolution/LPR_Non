// Config
import { getUrls } from '../config/runtimeConfig';

export interface FetchOptions extends RequestInit {
  queryParams?: Record<string, string>;
  skipAuth?: boolean;
  isFormData?: boolean;
  isService1?: boolean;
  isStream?: boolean;
  retryCount?: number;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach(p => {
    error ? p.reject(error) : p.resolve(token!);
  });
  failedQueue = [];
};

// ------------------------------------------
// Refresh Token API
// ------------------------------------------
const refreshTokenRequest = async () => {
  const { CENTER_API } = getUrls();
  const refreshToken = localStorage.getItem("token");

  if (!refreshToken) throw new Error("refresh token missing");

  const res = await fetch(`${CENTER_API}/users/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${refreshToken}`,
    },
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("cannot refresh token");
  }

  return res.json();
};

// ------------------------------------------
// Get new token or wait if refresh
// ------------------------------------------
const handleAuthError = async () => {
  if (!isRefreshing) {
    isRefreshing = true;

    try {
      const result = await refreshTokenRequest();
      const newToken = result.accessToken;

      localStorage.setItem("token", newToken);

      processQueue(null, newToken);
      return newToken;
    } 
    catch (err) {
      processQueue(err);
      throw err;
    } 
    finally {
      isRefreshing = false;
    }
  } 
  else {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }
};

// ------------------------------------------
// Main fetchClient
// ------------------------------------------
export const fetchClient = async <T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { queryParams, ...fetchOptions } = options;

  const makeRequest = async (token?: string): Promise<T> => {
    const headers: HeadersInit = {
      ...(options.isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token && !options.skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const queryString = queryParams
      ? "?" + new URLSearchParams(queryParams).toString()
      : "";

    let response: Response;

    try {
      response = await fetch(`${endpoint}${queryString}`, {
        ...fetchOptions,
        credentials: "include",
        headers,
      });
    } catch (err) {
      console.error("Network error:", err);

      // Network error -> logout only if authenticated
      if (!options.skipAuth && localStorage.getItem("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }

      throw err;
    }

    // ------------------------------------------
    // Handle Unauthorized
    // ------------------------------------------
    if (response.status === 401 || response.status === 403) {
      if (endpoint.includes("login")) {
        const t = await response.text();
        const err = new Error(t || response.statusText);
        (err as any).status = response.status;
        throw err;
      }

      // Prevent infinite recursion
      if (options.retryCount && options.retryCount > 1) {
        throw new Error("Too many retries");
      }

      try {
        const newToken = await handleAuthError();

        return makeRequest(newToken);
      } 
      catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        // Redirect ONLY IF NOT already on login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        throw err;
      }
    }

    if (!response.ok) {
      const t = await response.text();
      const err = new Error(t || response.statusText);
      (err as any).status = response.status;
      throw err;
    }

    return response.json();
  };

  const token = localStorage.getItem("token") || undefined;
  return makeRequest(token);
};

export const combineURL = (url: string, endpoint: string) => `${url}${endpoint}`;