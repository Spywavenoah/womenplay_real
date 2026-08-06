const BASE = "";

function getToken(): string | null {
  return localStorage.getItem("wp_token");
}

export function setToken(token: string): void {
  localStorage.setItem("wp_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("wp_token");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const options: RequestInit = {
    method,
    headers: getAuthHeaders(),
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${url}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body),
  put: <T>(url: string, body?: unknown) => request<T>("PUT", url, body),
  delete: <T>(url: string, body?: unknown) => request<T>("DELETE", url, body),
};

// Auth API
export interface AuthResponse {
  user: import("./types").User;
  token: string;
  message: string;
}

export const auth = {
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", data),
};

// Drop-in replacement for window.fetch that auto-injects auth headers
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };
  return fetch(url, { ...options, headers });
}
