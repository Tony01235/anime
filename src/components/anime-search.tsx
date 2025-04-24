import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useAnimeSearch } from '@/hooks/use-anime';
import AnimeCard from '@/components/anime-card';
import { AnimeRating, AnimeSearchResult } from '@shared/schema';
import { debounce } from '@/lib/utils';

interface AnimeSearchProps {
  onAnimeSelect: (anime: AnimeSearchResult, existingRating?: AnimeRating) => void;
}

const AnimeSearch: React.FC<AnimeSearchProps> = ({ onAnimeSelect }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { data, isLoading, refetch } = useAnimeSearch(searchQuery);

  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
  }, 500);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      refetch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  return (
    <div>
      <div className="relative max-w-xl mx-auto mb-8">
        <Input 
          placeholder="Anime suchen..." 
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          autoComplete="off"
          autoFocus={false}
          className="px-6 py-6 rounded-full border-sakura-200 dark:border-sakura-700 shadow-[0_4px_15px_rgba(255,146,165,0.3)] dark:shadow-[0_4px_15px_rgba(160,100,220,0.3)] focus:border-sakura-300 dark:focus:border-sakura-600"
        />
        <Button 
          onClick={handleSearch}
          disabled={isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-sakura-400 dark:bg-sakura-700 hover:bg-sakura-500 dark:hover:bg-sakura-600 text-white p-3 rounded-full transition-all duration-200"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </Button>
      </div>

      {/* Decorative element */}
      <div className="flex justify-center mt-4 mb-8">
        <svg className="h-6 opacity-30 dark:opacity-20" viewBox="0 0 150 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g className="text-sakura-300 dark:text-sakura-700">
            <circle cx="75" cy="15" r="5" fill="currentColor" />
            <circle cx="60" cy="15" r="4" fill="currentColor" />
            <circle cx="90" cy="15" r="4" fill="currentColor" />
            <circle cx="45" cy="15" r="3" fill="currentColor" />
            <circle cx="105" cy="15" r="3" fill="currentColor" />
            <circle cx="30" cy="15" r="2" fill="currentColor" />
            <circle cx="120" cy="15" r="2" fill="currentColor" />
            <circle cx="15" cy="15" r="1" fill="currentColor" />
            <circle cx="135" cy="15" r="1" fill="currentColor" />
          </g>
        </svg>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-sakura-400 dark:text-sakura-500 animate-spin" />
        </div>
      ) : (
        <div>
          {data?.data && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-center text-sakura-600 dark:text-sakura-300">
                Suchergebnisse
              </h2>
              
              {data.data.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-lg text-gray-600 dark:text-sakura-100">
                    Keine Ergebnisse gefunden. Versuche einen anderen Suchbegriff.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {data.data.map((anime) => (
                    <AnimeCard 
                      key={anime.mal_id} 
                      anime={anime} 
                      onClick={() => onAnimeSelect(anime)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimeSearch;
