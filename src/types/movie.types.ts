export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
  director: string;
}

/**
 * Respuesta de like
 */
export interface LikeResponse {
  success: boolean;
  data: {
    imdbId: string;
    likes: number;
  };
  message?: string;
}

/**
 * Respuesta de contador global
 */
export interface TotalLikesResponse {
  success: boolean;
  data: {
    totalLikes: number;
  };
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

// Respuesta de like individual
export interface LikeResponse {
  success: boolean;
  data: {
    imdbId: string;
    likes: number;
  };
  message?: string;
}

// Respuesta de contador global
export interface TotalLikesResponse {
  success: boolean;
  data: {
    totalLikes: number;
  };
  message?: string;
}

