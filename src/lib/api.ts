// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type ApiResponse<T = any> = {
  ok: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// Global redirect handler for auth errors
function handleAuthError() {
  if (typeof window !== "undefined") {
    // Store current URL to redirect back after login
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== "/login" && currentPath !== "/register") {
      localStorage.setItem("devstore_redirect_after_login", currentPath);
    }

    // Show toast/notification
    console.log("🔴 Session expired, redirecting to login...");

    // Redirect to login
    window.location.href = "/login?expired=true";
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(authenticated = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authenticated) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("🔑 Using token:", token.substring(0, 20) + "...");
      } else {
        console.warn("⚠️ No token found in localStorage for authenticated request!");
      }
    }

    return headers;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("devstore_token");
  }

  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("devstore_token", token);
    }
  }

  clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("devstore_token");
    }
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log("🔵 API Request:", { url, method: options.method || "GET" });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(false),
          ...options.headers,
        },
      });

      const data = await response.json();
      console.log("🟢 API Response:", { url, status: response.status, data });

      if (!response.ok) {
        return {
          ok: false,
          message: data.message || "Terjadi kesalahan",
          error: data.error,
        };
      }

      return {
        ok: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error("API request error:", error);
      return {
        ok: false,
        message: "Gagal menghubungi server",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async authenticatedRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    if (!token) {
      console.error("❌ No token available for authenticated request");
      return {
        ok: false,
        message: "Anda belum login. Silakan login terlebih dahulu.",
        error: "NO_TOKEN",
      };
    }

    console.log("🔵 Authenticated API Request:", { url, method: options.method || "GET", hasToken: !!token });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(true),
          ...options.headers,
        },
      });

      const data = await response.json();
      console.log("🟢 Authenticated API Response:", { url, status: response.status, data });

      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          console.error("❌ 401 Unauthorized - Token might be invalid or expired");
          this.clearToken(); // Clear invalid token

          // Trigger redirect to login
          handleAuthError();

          return {
            ok: false,
            message: "Sesi Anda telah berakhir. Silakan login kembali.",
            error: "UNAUTHORIZED",
          };
        }

        return {
          ok: false,
          message: data.message || "Terjadi kesalahan",
          error: data.error,
        };
      }

      return {
        ok: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error("❌ Authenticated API request error:", error);
      return {
        ok: false,
        message: "Gagal menghubungi server",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, authenticated = false): Promise<ApiResponse<T>> {
    return authenticated ? this.authenticatedRequest<T>(endpoint, { method: "GET" }) : this.request<T>(endpoint, { method: "GET" });
  }

  async post<T = any>(endpoint: string, body?: any, authenticated = false): Promise<ApiResponse<T>> {
    return authenticated
      ? this.authenticatedRequest<T>(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        })
      : this.request<T>(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
  }

  async patch<T = any>(endpoint: string, body?: any, authenticated = true): Promise<ApiResponse<T>> {
    return this.authenticatedRequest<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete<T = any>(endpoint: string, authenticated = true): Promise<ApiResponse<T>> {
    return this.authenticatedRequest<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient(API_URL);
