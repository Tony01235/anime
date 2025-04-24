import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { RatingCategoryBase, RatingCategory } from '@shared/schema';

export interface RatingCategoriesResponse {
  categories: RatingCategoryBase[];
}

// Hook to fetch rating categories from the server
export const useRatingCategories = () => {
  return useQuery<RatingCategoriesResponse>({
    queryKey: ['/api/rating-categories'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/rating-categories');
        return await response.json();
      } catch (error) {
        console.error('Error loading rating categories:', error);
        // Return default categories as fallback
        return {
          categories: [
            {
              id: "story",
              name: "Geschichte",
              description: "Bewertung der Handlung, Storytelling und narrativer Struktur"
            },
            {
              id: "animation",
              name: "Animation",
              description: "Qualität der Animation, Kunst und visueller Effekte"
            },
            {
              id: "characters",
              name: "Charaktere",
              description: "Tiefe und Entwicklung der Charaktere"
            },
            {
              id: "sound",
              name: "Sound",
              description: "Musik, Soundeffekte und Synchronisation"
            },
            {
              id: "enjoyment",
              name: "Unterhaltung",
              description: "Wie unterhaltsam und fesselnd war der Anime insgesamt"
            }
          ]
        };
      }
    }
  });
};

// Helper function to convert base categories to rating categories with values
export const mapBaseCategoriesToRatingCategories = (
  baseCategories: RatingCategoryBase[], 
  existingRatings?: Record<string, number>
): RatingCategory[] => {
  return baseCategories.map(category => ({
    ...category,
    value: existingRatings?.[category.id] || 0
  }));
};

// Helper function to calculate overall rating based on category ratings
export const calculateOverallRating = (
  categoryRatings: RatingCategory[] | number[]
): number => {
  if (!categoryRatings || categoryRatings.length === 0) {
    return 0;
  }
  
  let sum = 0;
  let count = 0;
  
  if (Array.isArray(categoryRatings) && typeof categoryRatings[0] === 'number') {
    // If we have an array of numbers
    sum = (categoryRatings as number[]).reduce((acc, rating) => acc + rating, 0);
    count = categoryRatings.length;
  } else {
    // If we have an array of RatingCategory objects
    const categories = categoryRatings as RatingCategory[];
    // Nicht filtern - alle Werte einbeziehen, auch 0
    const values = categories.map(cat => cat.value);
    sum = values.reduce((acc, val) => acc + val, 0);
    count = values.length; // Anzahl aller Kategorien
  }
  
  // Scale from 0-10 to 0-5 for overall rating and round to nearest 0.5
  const rating = count > 0 ? (sum / count) / 2 : 0;
  return Math.round(rating * 2) / 2; // Runde auf nächste 0.5
};