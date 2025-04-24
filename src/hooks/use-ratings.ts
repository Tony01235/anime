
import { useState, useEffect } from 'react';
import { AnimeRating } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export const useLocalStorage = () => {
  const [ratings, setRatings] = useState<AnimeRating[]>([]);
  const { toast } = useToast();

  // Load ratings from server after page load
  useEffect(() => {
    // Definieren der Lade-Funktion
    const loadRatings = () => {
      // Nur einmal aufrufen
      fetchRatings();
      // Event-Listener entfernen, wenn er bereits hinzugefügt wurde
      window.removeEventListener('load', loadRatingsOnLoad);
    };
    
    // Helfer-Funktion für den Event-Listener
    const loadRatingsOnLoad = () => setTimeout(fetchRatings, 500);
    
    // Prüfen, ob die Seite bereits geladen ist
    if (document.readyState === 'complete') {
      // Wenn geladen, direkt aufrufen
      fetchRatings();
    } else {
      // Wenn nicht geladen, auf "load"-Event warten
      window.addEventListener('load', loadRatingsOnLoad);
    }
    
    // Cleanup-Funktion
    return () => {
      window.removeEventListener('load', loadRatingsOnLoad);
    };
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/ratings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text(); // Erst als Text lesen
      console.log("Raw response:", text); // Log der rohen Antwort
      
      if (!text) {
        console.log("Empty response received");
        setRatings([]);
        return;
      }

      const data = JSON.parse(text);
      console.log("Parsed data:", data); // Log der geparsten Daten
      
      if (Array.isArray(data)) {
        setRatings(data);
        toast({
          title: "Bewertungen geladen",
          description: `${data.length} Bewertungen erfolgreich geladen.`,
          variant: "default"
        });
      } else {
        console.error("Unexpected data format:", data);
        toast({
          title: "Fehler beim Laden der Bewertungen",
          description: "Unerwartetes Datenformat vom Server erhalten.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      toast({
        title: "Fehler beim Laden der Bewertungen",
        description: "Deine Bewertungen konnten nicht geladen werden. Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  };

  const saveRating = async (rating: AnimeRating) => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rating)
      });
      
      if (!response.ok) throw new Error('Failed to save rating');
      const savedRating = await response.json();
      
      const updatedRatings = [...ratings];
      const existingIndex = updatedRatings.findIndex(r => r.id === rating.id);
      
      if (existingIndex >= 0) {
        updatedRatings[existingIndex] = savedRating;
      } else {
        updatedRatings.push(savedRating);
      }
      
      setRatings(updatedRatings);
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

  const deleteRating = async (id: string) => {
    try {
      const response = await fetch(`/api/ratings/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete rating');
      
      setRatings(ratings.filter(rating => rating.id !== id));
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
