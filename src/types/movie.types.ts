export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
  director: string;
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

