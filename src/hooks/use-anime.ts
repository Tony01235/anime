import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ApiResponse, AnimeDetail } from '@shared/schema';

export const useAnimeSearch = (query: string) => {
  return useQuery<ApiResponse>({
    queryKey: [`/api/anime/search?query=${query}`],
    queryFn: async () => {
      if (!query) return { data: [], pagination: { last_visible_page: 0, has_next_page: false } };
      
      const response = await apiRequest('GET', `/api/anime/search?query=${query}`);
      return await response.json();
    },
    enabled: !!query,
  });
};

export const useAnimeDetails = (animeId: number) => {
  return useQuery<AnimeDetail>({
    queryKey: [`/api/anime/${animeId}`],
    queryFn: async () => {
      if (!animeId) return null;
      
      const response = await apiRequest('GET', `/api/anime/${animeId}`);
      return await response.json();
    },
    enabled: !!animeId,
  });
};
