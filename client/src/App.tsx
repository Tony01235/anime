import { useState } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import SavedRatings from "@/pages/saved-ratings";
import NotFound from "@/pages/not-found";
import { AnimeRating } from "@shared/schema";
import AnimeRatingModal from "@/components/anime-rating-modal";
import { useQueryRatings } from "@/hooks/use-query-ratings";

function App() {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);
  const [currentRating, setCurrentRating] = useState<AnimeRating | null>(null);
  
  // Use the query ratings hook directly
  const { ratings, saveRating, deleteRating } = useQueryRatings();

  const openRatingModal = (anime: any, existingRating?: AnimeRating) => {
    setSelectedAnime(anime);
    setCurrentRating(existingRating || null);
    setIsRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setIsRatingModalOpen(false);
    setSelectedAnime(null);
    setCurrentRating(null);
  };

  const handleSaveRating = (rating: AnimeRating) => {
    saveRating(rating);
    closeRatingModal();
  };

  const handleDeleteRating = (id: string) => {
    deleteRating(id);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="anime-sakura-theme">
      <TooltipProvider>
        <Layout>
          <Switch>
            <Route path="/" component={() => <Home openRatingModal={openRatingModal} />} />
            <Route 
              path="/saved" 
              component={() => (
                <SavedRatings 
                  ratings={ratings} 
                  openRatingModal={openRatingModal} 
                  deleteRating={handleDeleteRating} 
                />
              )} 
            />
            <Route component={NotFound} />
          </Switch>

          {selectedAnime && (
            <AnimeRatingModal
              isOpen={isRatingModalOpen}
              onClose={closeRatingModal}
              anime={selectedAnime}
              existingRating={currentRating}
              onSave={handleSaveRating}
            />
          )}
        </Layout>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
