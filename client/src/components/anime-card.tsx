import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { AnimeSearchResult } from '@shared/schema';
import { extractYear } from '@/lib/utils';

interface AnimeCardProps {
  anime: AnimeSearchResult;
  onClick: (anime: AnimeSearchResult) => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  const handleClick = () => {
    onClick(anime);
  };

  const year = anime.aired?.from ? extractYear(anime.aired.from) : 'N/A';
  const type = anime.type || 'N/A';

  return (
    <div className="anime-card bg-white dark:bg-sakura-900">
      <div className="relative h-56">
        <img 
          src={anime.images.jpg.large_image_url || anime.images.jpg.image_url} 
          alt={anime.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
        <div className="absolute bottom-2 left-3 text-white">
          <h3 className="font-bold text-sm line-clamp-1">{anime.title}</h3>
          <p className="text-xs opacity-90">{type} • {year}</p>
        </div>

        {/* Overlay on hover */}
        <div className="anime-overlay">
          <Button 
            className="px-4 py-2 bg-white dark:bg-sakura-900 text-sakura-500 dark:text-sakura-300 rounded-full font-medium hover:bg-sakura-50 dark:hover:bg-sakura-800 transition-colors duration-200"
            onClick={handleClick}
          >
            <Star className="mr-1 h-4 w-4" /> Bewerten
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;
