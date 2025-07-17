import api from "../utils/axiosCustom";
import type { SuccessApiResponse } from "../types/response";

// Interface for user registration response
export interface RegisterResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

// Interface for student registration data
export interface StudentRegistrationData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role: string;
  level: string;
  school_name: string;
}

// Interface for teacher registration data
export interface TeacherRegistrationData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role: string;
  subjects: string[];
  experience: string;
  school_name: string;
}

/**
 * Register a new student
 * @param data Student registration data
 * @returns Promise with registration response
 */
export const registerStudent = async (
  data: StudentRegistrationData,
): Promise<SuccessApiResponse<RegisterResponse>> => {
  const response = await api.post<SuccessApiResponse<RegisterResponse>>(
    "/users/student",
    data,
  );
  return response.data;
};

/**
 * Register a new teacher
 * @param data Teacher registration data
 * @returns Promise with registration response
 */
export const registerTeacher = async (
  data: TeacherRegistrationData,
): Promise<SuccessApiResponse<RegisterResponse>> => {
  const response = await api.post<SuccessApiResponse<RegisterResponse>>(
    "/users/teacher",
    data,
  );
  return response.data;
};

export const fetchUserProfile = async (): Promise<
  SuccessApiResponse<RegisterResponse>
> => {
  try {
    const response =
      await api.get<SuccessApiResponse<RegisterResponse>>(`/users/my-profile`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
};

/**
 * Reset user password
 * @param email User's email
 * @param newPassword New password
 * @param confirmPassword The verification code sent to the user's email
 * @returns Promise with reset response
 */
export const resetPassword = async (
  email: string,
  newPassword: string,
  confirmPassword: string,
): Promise<SuccessApiResponse<void>> => {
  try {
    const response = await api.patch<SuccessApiResponse<void>>(
      "/users/change-password",
      {
        email: email,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Password reset failed:", error);
    throw error;
  }
};
