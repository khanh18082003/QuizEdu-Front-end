import type {
  PaginationResponse,
  SuccessApiResponse,
  TeacherProfileResponse,
} from "../types/response";
import api from "../utils/axiosCustom";

// Interface for classroom data
export interface Classroom {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  class_code: string;
  is_active: boolean;
  student_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Interface for creating a classroom
export interface CreateClassroomRequest {
  name: string;
  description: string;
  is_active: boolean;
}

// Interface for classroom list response
export interface ClassroomListResponse {
  classrooms: Classroom[];
  total: number;
}

// Interface for classroom response from API
export interface ClassRoomResponse {
  id: string;
  name: string;
  description: string;
  class_code: string;
  active: boolean;
  teacher: TeacherProfileResponse;
  created_at: string;
}

/**
 * Get all classrooms for the current teacher with pagination
 */
export const getClassrooms = async (
  page: number = 1,
  pageSize: number = 9,
): Promise<SuccessApiResponse<PaginationResponse<ClassRoomResponse>>> => {
  try {
    const response = await api.get<
      SuccessApiResponse<PaginationResponse<ClassRoomResponse>>
    >(`/users/classrooms/all?page=${page}&page_size=${pageSize}`);
    console.log("Fetched classrooms:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    throw error;
  }
};

/**
 * Create a new classroom
 */
export const createClassroom = async (
  classroomData: CreateClassroomRequest,
): Promise<SuccessApiResponse<Classroom>> => {
  try {
    const response = await api.post<SuccessApiResponse<Classroom>>(
      "/classrooms",
      classroomData,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating classroom:", error);
    throw error;
  }
};

/**
 * Get classroom by ID
 */
export const getClassroomById = async (
  id: string,
): Promise<SuccessApiResponse<Classroom>> => {
  try {
    const response = await api.get<SuccessApiResponse<Classroom>>(
      `/classrooms/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching classroom:", error);
    throw error;
  }
};

/**
 * Update a classroom
 */
export const updateClassroom = async (
  id: string,
  classroomData: Partial<CreateClassroomRequest>,
): Promise<SuccessApiResponse<Classroom>> => {
  try {
    const response = await api.put<SuccessApiResponse<Classroom>>(
      `/classrooms/${id}`,
      classroomData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating classroom:", error);
    throw error;
  }
};

/**
 * Delete a classroom
 */
export const deleteClassroom = async (
  id: string,
): Promise<SuccessApiResponse<void>> => {
  try {
    const response = await api.delete<SuccessApiResponse<void>>(
      `/classrooms/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting classroom:", error);
    throw error;
  }
};
