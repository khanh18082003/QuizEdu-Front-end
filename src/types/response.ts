import type { RegisterResponse } from "../services/userService";

export interface ApiResponse {
  code: string;
  status: number;
  message: string;
}

export interface SuccessApiResponse<T> extends ApiResponse {
  data: T;
}

export interface ErrorApiResponse extends ApiResponse {
  time_stamp: string;
  path: string;
  error: string;
}
export interface PaginationResponse<T> {
  page: number;
  page_size: number; // API của bạn dùng page_size
  pages: number;
  total: number;
  data: Array<T>;
}
export interface StudentProfileResponse extends RegisterResponse {
  level: string;
  school_name: string;
}

export interface TeacherProfileResponse extends RegisterResponse {
  subjects: Array<string>;
  experience: string;
  school_name: string;
  level?: string;
}
