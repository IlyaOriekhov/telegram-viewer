import {
  API_BASE_URL,
  STORAGE_KEYS,
  ERROR_MESSAGES,
} from "../utils/constants.js";

// HTTP Client Class
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // Get default headers
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle different response types
      if (!response.ok) {
        let errorMessage = ERROR_MESSAGES.NETWORK_ERROR;

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // If response is not JSON, use status text
          if (response.status === 401) {
            errorMessage = "Not authenticated";
          } else if (response.status === 403) {
            errorMessage = "Access forbidden";
          } else {
            errorMessage = response.statusText || errorMessage;
          }
        }

        // Log only non-auth errors to avoid spam
        if (response.status !== 401 && response.status !== 403) {
          console.error(`API Error (${endpoint}):`, errorMessage);
        }

        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      // Only log non-auth errors
      if (
        !error.message.includes("authenticated") &&
        !error.message.includes("forbidden")
      ) {
        console.error(`API Error (${endpoint}):`, error);
      }
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: "GET",
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

// API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authAPI = {
  register: (userData) => apiClient.post("/auth/register", userData),
  login: (credentials) => apiClient.post("/auth/login", credentials),
  getProfile: () => apiClient.get("/auth/me"),
  logout: () => apiClient.post("/auth/logout"),
};

// Telegram API
export const telegramAPI = {
  connect: (phoneData) => apiClient.post("/telegram/connect", phoneData),
  verify: (verifyData) => apiClient.post("/telegram/verify", verifyData),
  getChats: () => apiClient.get("/telegram/chats"),
  getMessages: (chatId, limit = 50) =>
    apiClient.get(`/telegram/messages/${chatId}`, { limit }),
  disconnect: () => apiClient.post("/telegram/disconnect"),
  getStatus: () => apiClient.get("/telegram/status"),
};

// General API
export const generalAPI = {
  healthCheck: () => apiClient.get("/health", {}, { includeAuth: false }),
};

export default apiClient;
