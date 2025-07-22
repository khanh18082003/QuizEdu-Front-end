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
  page_size: number;  // API của bạn dùng page_size
  pages: number;
  total: number;
  data: Array<T>;
}
