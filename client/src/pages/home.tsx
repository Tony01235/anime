import React, { useState } from 'react';
import { useLocation } from 'wouter';
import AnimeSearch from '@/components/anime-search';
import { Button } from '@/components/ui/button';
import { Search, Bookmark, ArrowLeft } from 'lucide-react';
import { AnimeRating, AnimeSearchResult } from '@shared/schema';
import { AnimeRecommendations } from '@/components/anime-recommendations';
import { CherryBlossom } from '@/components/cherry-blossom';
import { useQueryRatings } from '@/hooks/use-query-ratings';

interface HomeProps {
  openRatingModal: (anime: AnimeSearchResult, existingRating?: AnimeRating) => void;
}

const Home: React.FC<HomeProps> = ({ openRatingModal }) => {
  const [_, setLocation] = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const { ratings } = useQueryRatings();

  return (
    <div className="min-h-screen">
      <CherryBlossom count={15} />
      
      {showSearch ? (
        <section className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Button
              variant="ghost"
              className="text-sakura-500 dark:text-sakura-300 hover:text-sakura-600 dark:hover:text-sakura-200"
              onClick={() => setShowSearch(false)}
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Zurück zur Startseite
            </Button>
          </div>
          <AnimeSearch onAnimeSelect={openRatingModal} />
        </section>
      ) : (
        <>
          <section className="text-center py-16 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 relative">
                <svg 
                  className="w-52 h-32 mx-auto opacity-80" 
                  viewBox="0 0 200 100" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g className="text-sakura-300 dark:text-sakura-500">
                    {/* Stylized cherry blossom tree */}
                    <path d="M100 10C100 10 85 25 85 40C85 47.5 90 55 100 55C110 55 115 47.5 115 40C115 25 100 10 100 10Z" fill="currentColor" />
                    <path d="M70 25C70 25 60 35 65 45C68 50 75 50 80 45C85 40 75 25 70 25Z" fill="currentColor" />
                    <path d="M130 25C130 25 140 35 135 45C132 50 125 50 120 45C115 40 125 25 130 25Z" fill="currentColor" />
                    <path d="M100 55C100 55 95 70 100 80C105 90 115 90 120 80C125 70 115 55 100 55Z" fill="currentColor" />
                    <path d="M100 55C100 55 85 70 80 80C75 90 85 95 95 90C105 85 100 55 100 55Z" fill="currentColor" />
                  </g>
                  <path d="M100 90V100" stroke="#8B5A2B" strokeWidth="3" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-sakura-500 dark:text-sakura-300 mb-4">
                Willkommen bei Anime Sakura
              </h2>
              
              <p className="text-lg mb-8 text-gray-600 dark:text-sakura-100 opacity-90">
                Bewerte deine Lieblings-Animes in verschiedenen Kategorien und speichere deine Bewertungen für die Zukunft.
              </p>
              
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                <Button
                  className="px-6 py-6 bg-sakura-400 hover:bg-sakura-500 dark:bg-sakura-700 dark:hover:bg-sakura-600 text-white rounded-full shadow-[0_4px_15px_rgba(255,146,165,0.3)] dark:shadow-[0_4px_15px_rgba(160,100,220,0.3)] transition-all duration-300 font-medium"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="mr-2 h-5 w-5" /> Nach Animes suchen
                </Button>
                
                <Button
                  className="px-6 py-6 bg-white dark:bg-sakura-900 text-sakura-500 dark:text-sakura-300 border border-sakura-300 dark:border-sakura-700 hover:bg-sakura-50 dark:hover:bg-sakura-800 rounded-full transition-all duration-300 font-medium"
                  onClick={() => setLocation('/saved')}
                >
                  <Bookmark className="mr-2 h-5 w-5" /> Gespeicherte Bewertungen
                </Button>
              </div>
            </div>
          </section>
          
          {/* Anime Recommendations section */}
          {ratings.length > 0 && (
            <section className="container mx-auto px-4 py-8">
              <AnimeRecommendations 
                userRatings={ratings} 
                onAnimeSelect={openRatingModal} 
              />
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Home;