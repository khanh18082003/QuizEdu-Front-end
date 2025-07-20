import api from "../utils/axiosCustom";
import type {
  StudentProfileResponse,
  SuccessApiResponse,
  TeacherProfileResponse,
} from "../types/response";

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
  SuccessApiResponse<
    RegisterResponse | StudentProfileResponse | TeacherProfileResponse
  >
> => {
  try {
    const response =
      await api.get<
        SuccessApiResponse<
          RegisterResponse | StudentProfileResponse | TeacherProfileResponse
        >
      >(`/users/my-profile`);
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

/**
 * Update user profile with camelCase field names for the backend API
 * @param userData User data with snake_case field names
 * @param avatarFile Optional avatar file to upload
 * @param role User role (default: "student")
 * @returns Promise with the updated profile data
 */
export const updateUserProfile = async (
  userData: Partial<StudentProfileResponse | TeacherProfileResponse>,
  avatarFile?: File | null,
  role: string = "student",
): Promise<
  | SuccessApiResponse<StudentProfileResponse>
  | SuccessApiResponse<TeacherProfileResponse>
> => {
  try {
    // Validate file size if avatar is provided
    if (avatarFile) {
      // 5MB limit
      const maxSizeInBytes = 5 * 1024 * 1024;
      if (avatarFile.size > maxSizeInBytes) {
        throw new Error("Avatar image size must be less than 5MB");
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/jpg",
      ];
      if (!allowedTypes.includes(avatarFile.type)) {
        throw new Error("Only JPG, PNG and GIF images are supported");
      }
    }

    // Create a FormData object
    const formData = new FormData();

    // Add form fields with camelCase keys
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
        console.log("Adding field:", key, "with value:", value);
      }
    });

    // Add avatar file if provided
    if (avatarFile) {
      formData.append("avatar", avatarFile);
      console.log(`Adding avatar file: ${avatarFile.name}`);
    }

    const apiUrl = `/users/${role}/profile`;

    // Use a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    try {
      const response = await api.put<
        | SuccessApiResponse<StudentProfileResponse>
        | SuccessApiResponse<TeacherProfileResponse>
      >(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return response.data;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  } catch (error) {
    console.error("Failed to update user profile:", error);
    if (error instanceof Error) {
      throw new Error(`Profile update failed: ${error.message}`);
    } else {
      throw new Error("Profile update failed due to an unknown error");
    }
  }
};
