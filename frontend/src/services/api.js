import axios from "axios";

// Smart API URL detection
const getApiUrl = () => {
  // If VITE_API_URL is set, use it (for local dev/mobile testing)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Production: use relative path (works when frontend and backend are on same domain)
  // Or use current host with /api (works with proxy)

  // Development fallback
  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests and handle CSRF tokens
apiClient.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();

  // Add authorization token if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only set JSON content-type on methods that send a body.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    config.headers["Content-Type"] = "application/json";
  } else if (config.headers?.["Content-Type"]) {
    delete config.headers["Content-Type"];
  }

  // Add CSRF token for mutating requests (POST, PUT, PATCH, DELETE)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = localStorage.getItem("csrfToken");
    console.log(
      `[API] Preparing ${method} ${config.url}`,
      `csrfToken in localStorage: ${csrfToken ? csrfToken.substring(0, 10) + "..." : "NOT FOUND"}`,
    );

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
      console.log(
        `[API] ✓ Set X-CSRF-Token header: ${csrfToken.substring(0, 10)}...`,
      );
    } else {
      console.warn(
        `[API] ⚠ No CSRF token in localStorage! Available keys:`,
        Object.keys(localStorage),
      );
    }
  }

  return config;
});

// Handle errors and extract CSRF tokens from responses
apiClient.interceptors.response.use(
  (response) => {
    // Log all response headers for debugging
    console.log(
      `[API] Response headers for ${response.config.method.toUpperCase()} ${response.config.url}:`,
      response.headers,
    );

    // Extract and store CSRF token from response headers for future use
    // Try multiple header name variations (case-insensitive)
    let csrfToken =
      response.headers["x-csrf-token"] ||
      response.headers["X-CSRF-Token"] ||
      response.headers["X-Csrf-Token"];

    // Also check response body immediately
    if (!csrfToken && response.data) {
      console.log(
        `[API] Response body for ${response.config.method.toUpperCase()} ${response.config.url}:`,
        response.data,
      );
      csrfToken = response.data?.csrfToken;
    }

    if (csrfToken) {
      localStorage.setItem("csrfToken", csrfToken);
      console.log(
        `[API] ✓ Stored CSRF token (${csrfToken.substring(0, 10)}...)`,
      );
    } else {
      console.warn(
        `[API] ⚠ No CSRF token found in response for ${response.config.method.toUpperCase()} ${response.config.url}`,
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = error.response?.data?.message || "";

    // If CSRF token is invalid or expired, fetch a fresh token and retry once.
    if (
      error.response?.status === 403 &&
      errorMessage.toLowerCase().includes("csrf") &&
      !originalRequest?._retryCsrf &&
      originalRequest?.url !== "/auth/csrf-token"
    ) {
      originalRequest._retryCsrf = true;

      try {
        const refreshResponse = await apiClient.get("/auth/csrf-token");
        const refreshedToken =
          refreshResponse.headers["x-csrf-token"] ||
          refreshResponse.data?.csrfToken;

        if (refreshedToken) {
          localStorage.setItem("csrfToken", refreshedToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["X-CSRF-Token"] = refreshedToken;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("[API] Failed to refresh CSRF token:", refreshError);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
