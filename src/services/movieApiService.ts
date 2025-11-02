import axios, { AxiosInstance } from 'axios';
import { config } from '../config/config';


export interface NormalizedMovie {
  id: string;
  title: string;
  year: string;
  type: string;
  poster: string;
  rating: string;
}

class MovieApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.tmdbBaseUrl,
      timeout: 10000,
      params: {
        api_key: config.tmdbApiKey,
        language: 'en-US',
      },
    });
  }

  async fetchPopularMovies(): Promise<NormalizedMovie[]> {
    try {
      const response = await this.axiosInstance.get('/movie/popular', {
        params: { page: 1 },
      });

      return response.data.results.slice(0, 10).map((movie: any) => this.normalizeMovie(movie));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Error de API externa: ${error.message}`);
      }
      throw error;
    }
  }

  private normalizeMovie(movie: any): NormalizedMovie {
    return {
      id: movie.id.toString(),
      title: movie.title,
      year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
      type: 'movie',
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '',
      rating: movie.vote_average?.toFixed(1) || 'N/A',
    };
  }
}

export const movieApiService = new MovieApiService();
