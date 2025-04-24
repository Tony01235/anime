import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AnimeRating, AnimeSearchResult } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CherryBlossom } from '@/components/cherry-blossom';
import { Button } from '@/components/ui/button';

interface AnimeRecommendationsProps {
  userRatings: AnimeRating[];
  onAnimeSelect: (anime: AnimeSearchResult) => void;
}

export const AnimeRecommendations: React.FC<AnimeRecommendationsProps> = ({
  userRatings,
  onAnimeSelect
}) => {
  // Get the IDs of animes that the user has rated highly (>= 3.5)
  const highlyRatedAnimeIds = userRatings
    .filter(rating => rating.overallRating >= 3.5)
    .map(rating => rating.animeId)
    .slice(0, 5); // Use up to 5 anime IDs for recommendations
  
  // Query the recommendations
  const { data, isLoading, isError } = useQuery<{recommendations: AnimeSearchResult[]}>({
    queryKey: ['anime-recommendations', highlyRatedAnimeIds],
    queryFn: async () => {
      if (!highlyRatedAnimeIds.length) {
        return { recommendations: [] };
      }
      
      try {
        const response = await apiRequest(
          'GET', 
          `/api/recommendations?animeIds=${highlyRatedAnimeIds.join(',')}&limit=10`
        );
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        return { recommendations: [] };
      }
    },
    enabled: highlyRatedAnimeIds.length > 0,
  });
  
  // If the user hasn't rated enough animes yet, show a message
  if (userRatings.filter(r => r.overallRating >= 3.5).length === 0) {
    return (
      <div className="mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
          <CherryBlossom count={5} />
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-pink-600 dark:text-pink-400">
            Anime-Empfehlungen
          </h2>
          
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Bewerte mehr Animes mit mindestens 3,5 Sternen, um personalisierte Empfehlungen zu erhalten.
          </p>
        </div>
      </div>
    );
  }
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-pink-600 dark:text-pink-400">
          Anime-Empfehlungen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Display error state
  if (isError || !data) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-pink-600 dark:text-pink-400">
          Anime-Empfehlungen
        </h2>
        <p className="text-red-500">
          Beim Laden der Empfehlungen ist ein Fehler aufgetreten. Bitte versuche es später erneut.
        </p>
      </div>
    );
  }
  
  // Display no recommendations state
  if (data.recommendations.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-pink-600 dark:text-pink-400">
          Anime-Empfehlungen
        </h2>
        <p className="text-slate-700 dark:text-slate-300">
          Wir konnten basierend auf deinen Bewertungen keine Empfehlungen finden. Versuche, mehr verschiedene Animes zu bewerten.
        </p>
      </div>
    );
  }
  
  return (
    <div className="mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <CherryBlossom count={8} />
      </div>
      
      <h2 className="text-2xl font-semibold mb-4 text-pink-600 dark:text-pink-400 flex items-center">
        <span>Anime-Empfehlungen</span>
        <span className="ml-2 text-sm text-slate-500 dark:text-slate-400 font-normal">
          Basierend auf deinen Bewertungen
        </span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.recommendations.map((anime: AnimeSearchResult) => (
          <Card 
            key={anime.mal_id} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onAnimeSelect(anime)}
          >
            <div className="relative h-48 bg-slate-200 dark:bg-slate-700">
              <img
                src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                alt={anime.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/300x450?text=No+Image";
                }}
              />
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-medium text-sm sm:text-base line-clamp-2 h-12">
                {anime.title}
              </h3>
              <div className="mt-2 flex justify-between items-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {anime.type} • {anime.score ? `${anime.score}/10` : 'N/A'}
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};