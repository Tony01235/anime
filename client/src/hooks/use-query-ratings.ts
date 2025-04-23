import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimeRating } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/utils';

const RATINGS_QUERY_KEY = '/api/ratings';

/**
 * Custom hook für das Laden, Speichern und Löschen von Anime-Bewertungen mit React Query
 */
export const useQueryRatings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Lade Bewertungen
  const { data: ratings = [] } = useQuery<AnimeRating[]>({
    queryKey: [RATINGS_QUERY_KEY],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', RATINGS_QUERY_KEY);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error loading ratings:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 Minuten Cache-Zeit, um mehrfache Anfragen zu reduzieren
  });

  // Speichere/Aktualisiere Bewertung
  const saveMutation = useMutation({
    mutationFn: async (rating: AnimeRating) => {
      // Stelle sicher, dass die Bewertung eine ID hat
      const ratingWithId = {
        ...rating,
        id: rating.id || generateId(),
        createdAt: rating.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await apiRequest('POST', RATINGS_QUERY_KEY, ratingWithId);
      if (!response.ok) {
        throw new Error('Failed to save rating');
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Manuelles Update des Cache anstelle von Invalidierung, um mehrfache Netzwerkanfragen zu vermeiden
      queryClient.setQueriesData({ queryKey: [RATINGS_QUERY_KEY] }, (oldData: AnimeRating[] | undefined) => {
        if (!oldData) return [data];
        
        const existingIndex = oldData.findIndex(rating => rating.id === data.id);
        if (existingIndex >= 0) {
          // Aktualisiere die bestehende Bewertung
          const newData = [...oldData];
          newData[existingIndex] = data;
          return newData;
        } else {
          // Füge neue Bewertung hinzu
          return [...oldData, data];
        }
      });
      
      // Toast nur einmal anzeigen
      toast({
        title: "Bewertung gespeichert",
        description: "Deine Anime-Bewertung wurde erfolgreich gespeichert.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error saving rating:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Deine Bewertung konnte nicht gespeichert werden. Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });

  // Lösche Bewertung
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `${RATINGS_QUERY_KEY}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete rating');
      }
      return id;
    },
    onSuccess: (deletedId) => {
      // Manuelles Update des Cache anstelle von Invalidierung, um mehrfache Netzwerkanfragen zu vermeiden
      queryClient.setQueriesData({ queryKey: [RATINGS_QUERY_KEY] }, (oldData: AnimeRating[] | undefined) => {
        if (!oldData) return [];
        // Filtere die gelöschte Bewertung aus dem Cache
        return oldData.filter(rating => rating.id !== deletedId);
      });
      
      toast({
        title: "Bewertung gelöscht",
        description: "Die Anime-Bewertung wurde erfolgreich gelöscht.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Error deleting rating:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Bewertung konnte nicht gelöscht werden. Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });

  // Finde eine Bewertung nach Anime-ID
  const getRatingByAnimeId = (animeId: number) => {
    return ratings.find(rating => rating.animeId === animeId) || null;
  };

  return {
    ratings,
    saveRating: (rating: AnimeRating) => saveMutation.mutate(rating),
    deleteRating: (id: string) => deleteMutation.mutate(id),
    getRatingByAnimeId,
    isLoading: saveMutation.isPending || deleteMutation.isPending
  };
};