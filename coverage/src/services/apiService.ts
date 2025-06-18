import { openDB } from "idb";

// Create a wrapper for Firebase Cloud Functions
class FirebaseApiService {
  private baseURL: string;

  constructor() {
    this.baseURL =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV
        ? "http://localhost:5001/safespec-ohs/us-central1/api"
        : "https://us-central1-safespec-ohs.cloudfunctions.net/api");
  }

  // Generic HTTP request method
  async request(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestInit,
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;

    // Get auth token
    const token = localStorage.getItem("token");

    const config: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    };

    if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(
              `${this.baseURL}/auth/refresh-token`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
              },
            );

            if (refreshResponse.ok) {
              const { token: newToken, refreshToken: newRefreshToken } =
                await refreshResponse.json();
              localStorage.setItem("token", newToken);
              localStorage.setItem("refreshToken", newRefreshToken);

              // Retry original request with new token
              config.headers = {
                ...config.headers,
                Authorization: `Bearer ${newToken}`,
              };

              const retryResponse = await fetch(url, config);
              if (retryResponse.ok) {
                return await retryResponse.json();
              }
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }

        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        throw new Error("Authentication failed");
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Request failed" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Handle offline mode
      if (!navigator.onLine) {
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
          await this.storeOfflineRequest({ method, endpoint, data });
          return { offline: true, queued: true };
        } else {
          // Try to return cached data for GET requests
          return await this.getCachedData(endpoint);
        }
      }

      throw error;
    }
  }

  // HTTP method shortcuts
  async get(endpoint: string, options?: RequestInit) {
    return this.request("GET", endpoint, undefined, options);
  }

  async post(endpoint: string, data?: any, options?: RequestInit) {
    return this.request("POST", endpoint, data, options);
  }

  async put(endpoint: string, data?: any, options?: RequestInit) {
    return this.request("PUT", endpoint, data, options);
  }

  async patch(endpoint: string, data?: any, options?: RequestInit) {
    return this.request("PATCH", endpoint, data, options);
  }

  async delete(endpoint: string, options?: RequestInit) {
    return this.request("DELETE", endpoint, undefined, options);
  }

  // File upload method
  async upload(
    endpoint: string,
    file: File,
    additionalData?: any,
  ): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    const token = localStorage.getItem("token");

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // Store offline requests for later sync
  private async storeOfflineRequest(request: any) {
    try {
      const db = await openDB("safespec-offline", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("syncQueue")) {
            db.createObjectStore("syncQueue", {
              keyPath: "id",
              autoIncrement: true,
            });
          }
        },
      });

      const tx = db.transaction("syncQueue", "readwrite");
      const store = tx.objectStore("syncQueue");

      await store.add({
        ...request,
        timestamp: new Date().toISOString(),
        url: `${this.baseURL}${request.endpoint}`,
      });

      return tx.done;
    } catch (error) {
      console.error("Failed to store offline request:", error);
    }
  }

  // Get cached data for offline mode
  private async getCachedData(endpoint: string) {
    try {
      const db = await openDB("safespec-offline", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("offlineCache")) {
            db.createObjectStore("offlineCache", { keyPath: "endpoint" });
          }
        },
      });

      const store = db
        .transaction("offlineCache", "readonly")
        .objectStore("offlineCache");
      const cachedData = await store.get(endpoint);

      if (cachedData) {
        return { ...cachedData.data, offline: true, cached: true };
      }

      throw new Error("No cached data available");
    } catch (error) {
      throw new Error("No cached data available");
    }
  }

  // Cache GET responses for offline use
  async cacheResponse(endpoint: string, data: any) {
    try {
      const db = await openDB("safespec-offline", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("offlineCache")) {
            db.createObjectStore("offlineCache", { keyPath: "endpoint" });
          }
        },
      });

      const tx = db.transaction("offlineCache", "readwrite");
      const store = tx.objectStore("offlineCache");

      await store.put({
        endpoint,
        data,
        timestamp: new Date().toISOString(),
      });

      return tx.done;
    } catch (error) {
      console.error("Failed to cache response:", error);
    }
  }

  // Sync offline requests when back online
  async syncOfflineRequests() {
    try {
      const db = await openDB("safespec-offline", 1);
      const tx = db.transaction("syncQueue", "readonly");
      const store = tx.objectStore("syncQueue");
      const requests = await store.getAll();

      for (const request of requests) {
        try {
          await this.request(request.method, request.endpoint, request.data);

          // Remove successfully synced request
          const deleteTx = db.transaction("syncQueue", "readwrite");
          const deleteStore = deleteTx.objectStore("syncQueue");
          await deleteStore.delete(request.id);
        } catch (error) {
          console.error("Failed to sync request:", error);
        }
      }
    } catch (error) {
      console.error("Failed to sync offline requests:", error);
    }
  }

  // Get pending sync count
  async getPendingSyncCount(): Promise<number> {
    try {
      const db = await openDB("safespec-offline", 1);
      const tx = db.transaction("syncQueue", "readonly");
      const store = tx.objectStore("syncQueue");
      const requests = await store.getAll();
      return requests.length;
    } catch (error) {
      return 0;
    }
  }
}

// Create and export the API service instance
export const api = new FirebaseApiService();

// Export for backward compatibility
export default api;

// Cache response helper function
export async function cacheResponse(endpoint: string, data: any) {
  return api.cacheResponse(endpoint, data);
}
