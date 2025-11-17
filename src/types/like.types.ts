export interface LikeResponse {
    success: boolean;
    message?: string;
    data?: {
        imdbId: string;
        likes: number;
        previousLikes?: number;
    };
}
