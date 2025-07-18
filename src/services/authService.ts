// Example of using the custom axios instance
import type { SuccessApiResponse } from "../types/response";
import type { TokenResponse } from "../types/token";
import api from "../utils/axiosCustom";

// Interface for login request
interface LoginRequest {
  email: string;
  password: string;
  role: string;
  platform?: string; // Optional, can be used to specify platform (web, mobile, etc.)
  version?: string; // Optional, can be used to specify app version
  device_token?: string; // Optional, can be used to specify device token for push notifications
}

// Interface for logout request
interface LogoutRequest {
  role: string;
}

export const loginUser = async (
  authenticationRequest: LoginRequest,
): Promise<SuccessApiResponse<TokenResponse>> => {
  try {
    // Make login request
    const response = await api.post<SuccessApiResponse<TokenResponse>>(
      "/auth",
      authenticationRequest,
    );

    // Return the user info
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Logout user from the system
 * @param logoutRequest Request containing user role
 * @returns Promise with logout response
 */
export const logoutUser = async (
  logoutRequest: LogoutRequest,
): Promise<SuccessApiResponse<void>> => {
  try {
    const response = await api.post<SuccessApiResponse<void>>(
      "/auth/logout",
      logoutRequest,
    );
    return response.data;
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

/**
 * Verify a user account with verification code
 * @param userId User's ID
 * @param code Verification code (6 characters)
 * @returns Promise with verification response
 */
export const verifyUser = async (
  email: string,
  code: string,
): Promise<SuccessApiResponse<void>> => {
  try {
    const response = await api.post<SuccessApiResponse<void>>(
      "/auth/verification-code",
      { email: email, code },
    );
    return response.data;
  } catch (error) {
    console.error("Verification failed:", error);
    throw error;
  }
};

/**
 * Resend verification code to user's email
 * @param userId User's ID
 * @returns Promise with resend verification response
 */
export const resendVerificationCode = async (
  email: string,
  firstName: string,
  lastName: string,
): Promise<SuccessApiResponse<void>> => {
  try {
    const response = await api.post<SuccessApiResponse<void>>(
      "/auth/resend-code",
      { email, first_name: firstName, last_name: lastName },
    );
    return response.data;
  } catch (error) {
    console.error("Resend verification code failed:", error);
    throw error;
  }
};

/**
 * Request a password reset for a user
 * @param email User's email address
 * @returns Promise with password reset request response
 */
export const requestPasswordReset = async (
  email: string,
): Promise<SuccessApiResponse<void>> => {
  try {
    const response = await api.post<SuccessApiResponse<void>>(
      "/auth/forgot-password",
      { email },
    );
    return response.data;
  } catch (error) {
    console.error("Password reset request failed:", error);
    throw error;
  }
};

export const outboundAuthentication = async (
  code: string,
  role: string = "student",
): Promise<SuccessApiResponse<TokenResponse>> => {
  try {
    // Make login request
    const response = await api.post<SuccessApiResponse<TokenResponse>>(
      `/auth/outbound/authentication?code=${code}&role=${role}`,
    );
    // Return the user info
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
