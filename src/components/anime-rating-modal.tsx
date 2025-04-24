import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SaveIcon, X } from 'lucide-react';
import StarRating from '@/components/ui/star-rating';
import { useToast } from '@/hooks/use-toast';
import { AnimeRating, AnimeSearchResult, RatingCategory } from '@shared/schema';
import { generateId, extractYear } from '@/lib/utils';
import { useAnimeDetails } from '@/hooks/use-anime';
import { 
  useRatingCategories, 
  calculateOverallRating,
  mapBaseCategoriesToRatingCategories
} from '@/hooks/use-rating-categories';

interface AnimeRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: AnimeSearchResult;
  existingRating?: AnimeRating | null;
  onSave: (rating: AnimeRating) => void;
}

const AnimeRatingModal: React.FC<AnimeRatingModalProps> = ({
  isOpen,
  onClose,
  anime,
  existingRating,
  onSave
}) => {
  const { toast } = useToast();
  const { data: animeDetails, isLoading } = useAnimeDetails(anime.mal_id);
  const { data: categoriesData, isLoading: isLoadingCategories } = useRatingCategories();
  
  const [categories, setCategories] = useState<RatingCategory[]>([]);
  const [notes, setNotes] = useState<string>(existingRating?.notes || '');
  const [overallRating, setOverallRating] = useState<number>(
    existingRating?.overallRating || 0
  );

  // Initialize or update categories when data is loaded
  useEffect(() => {
    if (categoriesData?.categories && categoriesData.categories.length > 0) {
      if (existingRating) {
        // When editing an existing rating, use the existing values
        const existingValues: Record<string, number> = {};
        existingRating.categories.forEach(cat => {
          if ('id' in cat && 'value' in cat) {
            existingValues[cat.id] = cat.value;
          }
        });
        
        // Map base categories to rating categories with values
        const ratingCategories = mapBaseCategoriesToRatingCategories(
          categoriesData.categories, 
          existingValues
        );
        setCategories(ratingCategories);
      } else {
        // For a new rating, start with all zeroes
        const ratingCategories = mapBaseCategoriesToRatingCategories(
          categoriesData.categories
        );
        setCategories(ratingCategories);
        setNotes('');
        setOverallRating(0);
      }
    }
  }, [categoriesData, existingRating, isOpen]);

  useEffect(() => {
    // Calculate overall rating when categories change
    const newOverall = calculateOverallRating(categories);
    setOverallRating(newOverall);
  }, [categories]);

  const handleCategoryRatingChange = (index: number, value: number) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = { 
      ...updatedCategories[index], 
      value 
    };
    setCategories(updatedCategories);
  };

  const handleSaveRating = () => {
    const hasRatings = categories.some(cat => cat.value > 0);
    
    if (!hasRatings) {
      toast({
        title: "Bewertung fehlt",
        description: "Bitte bewerte mindestens eine Kategorie.",
        variant: "destructive"
      });
      return;
    }

    const newRating: AnimeRating = {
      id: existingRating?.id || generateId(),
      animeId: anime.mal_id,
      animeTitle: anime.title,
      animeImage: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
      categories: categories,
      overallRating: overallRating,
      notes: notes,
      createdAt: existingRating?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newRating);
    
    toast({
      title: `${existingRating ? 'Bewertung aktualisiert' : 'Bewertung gespeichert'}`,
      description: `Deine Bewertung für ${anime.title} wurde erfolgreich ${existingRating ? 'aktualisiert' : 'gespeichert'}.`,
    });
  };

  const renderDetails = () => {
    if (isLoading) {
      return <div className="text-sm text-gray-600 dark:text-sakura-100 mb-4">Lade Details...</div>;
    }
    
    if (!animeDetails) {
      return <div className="text-sm text-gray-600 dark:text-sakura-100 mb-4">{anime.type || 'Anime'}</div>;
    }
    
    const year = animeDetails.aired?.from ? extractYear(animeDetails.aired.from) : 'N/A';
    const episodes = animeDetails.episodes ? `${animeDetails.episodes} Episoden` : '';
    const studios = animeDetails.studios?.map(s => s.name).join(', ');
    
    return (
      <div className="text-sm text-gray-600 dark:text-sakura-100 mb-4">
        {animeDetails.type} • {year} {episodes && `• ${episodes}`} 
        {studios && <div className="mt-1">Studios: {studios}</div>}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-sakura-50 dark:bg-sakura-800 max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="bg-sakura-100 dark:bg-sakura-900 px-6 py-4 flex justify-between items-center border-b border-sakura-200 dark:border-sakura-700">
          <div>
            <DialogTitle className="text-xl font-bold text-sakura-600 dark:text-sakura-300">Anime bewerten</DialogTitle>
            <DialogDescription className="text-sm text-sakura-400 dark:text-sakura-300 mt-1">
              Bewerte den Anime in verschiedenen Kategorien auf einer Skala von 0-10
            </DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-7 h-7 p-0 text-sakura-500 hover:text-sakura-700 dark:text-sakura-300 dark:hover:text-sakura-100">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Anime Image */}
            <div className="w-full md:w-1/3">
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src={anime.images.jpg.large_image_url || anime.images.jpg.image_url} 
                  alt={anime.title} 
                  className="w-full object-cover h-64 md:h-auto"
                />
              </div>
            </div>
            
            {/* Anime Info & Rating */}
            <div className="w-full md:w-2/3">
              <h2 className="text-2xl font-bold mb-2 text-sakura-600 dark:text-sakura-300">{anime.title}</h2>
              {renderDetails()}
              
              {animeDetails?.synopsis && (
                <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                  <p className="line-clamp-4">{animeDetails.synopsis}</p>
                </div>
              )}
              
              {/* Rating Categories */}
              <div className="space-y-4">
                <h4 className="font-bold text-sakura-500 dark:text-sakura-300">Bewertungskategorien (0-10 Sterne)</h4>
                
                {isLoadingCategories ? (
                  <div className="text-sakura-500 dark:text-sakura-300">Lade Kategorien...</div>
                ) : categories.length === 0 ? (
                  <div className="text-sakura-500 dark:text-sakura-300">Keine Kategorien gefunden</div>
                ) : (
                  categories.map((category, index) => (
                    <div key={category.id} className="rating-category">
                      <div className="flex justify-between mb-1">
                        <Label className="text-sm font-medium text-gray-700 dark:text-sakura-100">
                          {category.name}
                        </Label>
                        <span className="text-sm text-sakura-500 dark:text-sakura-300">
                          {category.value.toFixed(1)} / 10
                        </span>
                      </div>
                      <div className="tooltip" title={category.description}>
                        <StarRating 
                          initialRating={category.value} 
                          max={10}
                          precision={0.5}
                          onChange={(value) => handleCategoryRatingChange(index, value)}
                          colorFilled="text-sakura-400 dark:text-sakura-500"
                        />
                      </div>
                    </div>
                  ))
                )}
                
                {/* Overall Rating */}
                <div className="mt-8 flex flex-col items-center">
                  <h4 className="font-bold text-sakura-500 dark:text-sakura-300 mb-2">Gesamtbewertung</h4>
                  <div className="relative mb-2">
                    <StarRating 
                      initialRating={overallRating} 
                      max={5}
                      precision={0.5}
                      readOnly
                      size="lg"
                      colorFilled="text-sakura-400 dark:text-sakura-500"
                    />
                  </div>
                  <span className="text-xl font-bold text-sakura-500 dark:text-sakura-300">
                    {overallRating.toFixed(1)} / 5.0
                  </span>
                </div>
                
                {/* Notes Section */}
                <div className="mt-6">
                  <Label htmlFor="ratingNotes" className="block text-sm font-medium text-gray-700 dark:text-sakura-100 mb-1">
                    Notizen (optional)
                  </Label>
                  <Textarea 
                    id="ratingNotes" 
                    rows={3}
                    autoFocus={false}
                    className="w-full rounded-md border border-sakura-200 dark:border-sakura-700 bg-white dark:bg-sakura-900 p-3 text-gray-700 dark:text-sakura-100 focus:border-sakura-400 dark:focus:border-sakura-600 focus:outline-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <DialogFooter className="bg-sakura-50 dark:bg-sakura-900 px-6 py-4 border-t border-sakura-200 dark:border-sakura-700">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-sakura-500 dark:text-sakura-300 hover:text-sakura-700 dark:hover:text-sakura-100 border border-sakura-200 dark:border-sakura-700"
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleSaveRating}
            className="px-6 py-2 bg-sakura-400 hover:bg-sakura-500 dark:bg-sakura-700 dark:hover:bg-sakura-600 text-white rounded-md shadow-sm transition-all duration-200"
          >
            <SaveIcon className="mr-2 h-4 w-4" /> Bewertung speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnimeRatingModal;