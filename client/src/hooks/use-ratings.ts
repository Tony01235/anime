import { useState, useEffect } from 'react';
import { AnimeRating } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'anime-sakura-ratings';

export const useLocalStorage = () => {
  const [ratings, setRatings] = useState<AnimeRating[]>([]);
  const { toast } = useToast();

  // Load ratings from localStorage on component mount
  useEffect(() => {
    try {
      const storedRatings = localStorage.getItem(STORAGE_KEY);
      if (storedRatings) {
        setRatings(JSON.parse(storedRatings));
      }
    } catch (error) {
      console.error('Error loading ratings from localStorage:', error);
      toast({
        title: "Fehler beim Laden der Bewertungen",
        description: "Deine Bewertungen konnten nicht geladen werden. Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  }, []);

  // Save a new rating or update an existing one
  const saveRating = (rating: AnimeRating) => {
    try {
      const updatedRatings = [...ratings];
      const existingIndex = updatedRatings.findIndex(r => r.id === rating.id);
      
      if (existingIndex >= 0) {
        updatedRatings[existingIndex] = rating;
      } else {
        updatedRatings.push(rating);
      }
      
      setRatings(updatedRatings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRatings));
      
      return true;
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Deine Bewertung konnte nicht gespeichert werden. Bitte versuche es später erneut.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete a rating
  const deleteRating = (id: string) => {
    try {
      const updatedRatings = ratings.filter(rating => rating.id !== id);
      setRatings(updatedRatings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRatings));
      return true;
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Bewertung konnte nicht gelöscht werden. Bitte versuche es später erneut.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get a specific rating by anime ID
  const getRatingByAnimeId = (animeId: number) => {
    return ratings.find(rating => rating.animeId === animeId) || null;
  };

  return {
    ratings,
    saveRating,
    deleteRating,
    getRatingByAnimeId
  };
};
