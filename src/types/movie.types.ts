export interface Movie {
  id: number;
  title: string;
  year: number;
  type: string;       // 'movie' por ahora
  poster: string;     // URL del poster
  rating: string;     // rating de TMDB
  likes: number;      // likes obtenidos desde la BD
}

/**
 * Respuesta de like
 */
export interface LikeResponse {
  success: boolean;
  data: {
    id: string;   // ID de TMDB
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
