import { useQuery } from '@tanstack/react-query';
import { AnimeRating, AnimeSearchResult } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export interface RecommendationResponse {
  recommendations: AnimeSearchResult[];
}

/**
 * A hook to get anime recommendations based on user's ratings
 * @param userRatings Array of user's anime ratings
 * @param limit Maximum number of recommendations to return
 * @returns Query result with recommendations
 */
export const useAnimeRecommendations = (userRatings: AnimeRating[], limit: number = 10) => {
  // Get the IDs of animes that the user has rated highly (>= 3.5)
  const highlyRatedAnimeIds = userRatings
    .filter(rating => rating.overallRating >= 3.5)
    .map(rating => rating.animeId)
    .slice(0, 5); // Use up to 5 anime IDs for recommendations
  
  return useQuery<RecommendationResponse>({
    queryKey: ['anime-recommendations', highlyRatedAnimeIds],
    queryFn: async () => {
      if (!highlyRatedAnimeIds.length) {
        return { recommendations: [] };
      }
      
      try {
        const response = await apiRequest(
          'GET', 
          `/api/recommendations?animeIds=${highlyRatedAnimeIds.join(',')}&limit=${limit}`
        );
        return await response.json();
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        return { recommendations: [] };
      }
    },
    enabled: highlyRatedAnimeIds.length > 0,
  });
};