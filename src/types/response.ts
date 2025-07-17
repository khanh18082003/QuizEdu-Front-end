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
