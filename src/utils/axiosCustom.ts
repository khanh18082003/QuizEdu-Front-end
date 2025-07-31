import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import type { SuccessApiResponse } from "../types/response";

// Base axios instance configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:8080/api/v1.0",
  withCredentials: true, // Include cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Set authentication credentials
 * @param token The access token to save
 */
export const setAuthCredentials = (token: string) => {
  sessionStorage.setItem("token", token);
};

/**
 * Clear user credentials (for logout)
 */
export const clearAuthCredentials = () => {
  sessionStorage.removeItem("token");
};

interface RefreshTokenResponse {
  access_token: string;
}

// Function to refresh token
const refreshToken = async (): Promise<string> => {
  try {
    const response = await axios.post<SuccessApiResponse<RefreshTokenResponse>>(
      "http://localhost:8080/api/v1.0/auth/refresh-token",
      {}, // Empty body or add required data if your API needs it
      {
        withCredentials: true, // This ensures cookies are sent with the request
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Get the new token
    const newToken = response.data.data.access_token;
    sessionStorage.setItem("token", newToken);

    // Return the new token
    return newToken;
  } catch (error) {
    const err = error as Error & {
      response?: {
        status: number;
        data: unknown;
      };
    };

    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }

    // If refresh token fails, clear credentials and throw error
    clearAuthCredentials();
    throw error;
  }
};

// Request interceptor - adds auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // If we have an access token, add it to the header
    const accessToken = sessionStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handles token refresh on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("401 error detected, attempting to refresh token");
      originalRequest._retry = true;

      try {
        // Get a new token
        const newToken = await refreshToken();
        console.log("Token refreshed, updating request headers");

        // Update the authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Retry the original request
        console.log("Retrying original request");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh failed, redirect to login or handle as needed
        window.location.href = "/authentication/login";
        return Promise.reject(refreshError);
      }
    }

    // For any other errors, just reject the promise
    return Promise.reject(error);
  },
);

export default axiosInstance;
