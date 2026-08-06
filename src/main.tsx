import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global fetch interceptor: auto-inject the auth token on same-origin API requests.
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let pathname = "";
  let rawUrl = "";

  if (typeof input === "string") {
    rawUrl = input;
  } else if (input instanceof URL) {
    rawUrl = input.toString();
  } else if (input instanceof Request) {
    rawUrl = input.url;
  }

  try {
    if (rawUrl.startsWith("/")) {
      pathname = rawUrl;
    } else {
      pathname = new URL(rawUrl, window.location.origin).pathname;
    }
  } catch {
    pathname = "";
  }

  if (pathname.startsWith("/api/")) {
    const isPublicAuth = pathname.startsWith("/api/auth/login") ||
                         pathname.startsWith("/api/auth/register") ||
                         pathname.startsWith("/api/auth/verify-email") ||
                         pathname.startsWith("/api/auth/forgot-password") ||
                         pathname.startsWith("/api/auth/reset-password") ||
                         pathname.startsWith("/api/auth/activate") ||
                         pathname.startsWith("/api/auth/resend-verification");

    const token = localStorage.getItem("wp_token");

    if (input instanceof Request) {
      const clonedReq = input.clone();
      if (!clonedReq.headers.has("X-Request-Id")) {
        clonedReq.headers.set("X-Request-Id", `web_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 6)}`);
      }
      if (!isPublicAuth && token && !clonedReq.headers.has("Authorization")) {
        clonedReq.headers.set("Authorization", `Bearer ${token}`);
      }
      return originalFetch(clonedReq, init);
    } else {
      const headers = new Headers(init?.headers);
      if (!headers.has("X-Request-Id")) {
        headers.set("X-Request-Id", `web_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 6)}`);
      }
      if (!isPublicAuth && token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return originalFetch(input, { ...init, headers });
    }
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
