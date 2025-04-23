import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, Trash2, Edit, ChevronLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AnimeRating, AnimeSearchResult } from '@shared/schema';
import StarRating from '@/components/ui/star-rating';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface SavedRatingsProps {
  ratings: AnimeRating[];
  openRatingModal: (anime: AnimeSearchResult, existingRating: AnimeRating) => void;
  deleteRating: (id: string) => void;
}

const SavedRatings: React.FC<SavedRatingsProps> = ({ 
  ratings, 
  openRatingModal, 
  deleteRating 
}) => {
  const { toast } = useToast();
  const [ratingToDelete, setRatingToDelete] = useState<string | null>(null);

  const handleDeleteRating = () => {
    if (ratingToDelete) {
      deleteRating(ratingToDelete);
      toast({
        title: "Bewertung gelöscht",
        description: "Die Bewertung wurde erfolgreich gelöscht.",
      });
      setRatingToDelete(null);
    }
  };

  const handleEditRating = (rating: AnimeRating) => {
    const anime = {
      mal_id: rating.animeId,
      title: rating.animeTitle,
      images: {
        jpg: {
          large_image_url: rating.animeImage,
          image_url: rating.animeImage,
          small_image_url: rating.animeImage,
        },
      },
    } as AnimeSearchResult;
    
    openRatingModal(anime, rating);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-sakura-600 dark:text-sakura-300">
          Meine bewerteten Animes
        </h2>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Zurück
          </Button>
        </Link>
      </div>

      {ratings.length === 0 ? (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="w-16 h-16 text-sakura-300 dark:text-sakura-700 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-center">Keine Bewertungen gefunden</h3>
            <p className="text-muted-foreground text-center mb-6">
              Du hast noch keine Anime-Bewertungen gespeichert.
            </p>
            <Link href="/">
              <Button className="bg-sakura-400 hover:bg-sakura-500 dark:bg-sakura-700 dark:hover:bg-sakura-600">
                <Home className="mr-2 h-4 w-4" /> Zur Startseite
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white dark:bg-sakura-900 shadow-md">
          <div className="custom-scrollbar overflow-y-auto max-h-[calc(100vh-200px)]">
            <table className="w-full">
              <thead className="bg-sakura-100 dark:bg-sakura-800 text-sakura-600 dark:text-sakura-300">
                <tr>
                  <th className="py-3 px-4 text-left">Anime</th>
                  <th className="py-3 px-4 text-center w-24">Bewertung</th>
                  <th className="py-3 px-4 text-right w-24">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((rating) => (
                  <tr 
                    key={rating.id} 
                    className="border-b border-sakura-100 dark:border-sakura-800 hover:bg-sakura-50 dark:hover:bg-sakura-800"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <img 
                          src={rating.animeImage} 
                          alt={rating.animeTitle} 
                          className="w-10 h-10 rounded object-cover mr-3" 
                        />
                        <div>
                          <h4 className="font-medium">{rating.animeTitle}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Bewertet am {formatDate(rating.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <div className="flex items-center space-x-1">
                          <StarRating initialRating={rating.overallRating} readOnly size="sm" colorFilled="text-sakura-400 dark:text-sakura-500" />
                          <span className="font-medium">{rating.overallRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-blue-500 hover:text-blue-700 dark:text-sakura-300 dark:hover:text-sakura-100 mr-1 h-8 w-8"
                        onClick={() => handleEditRating(rating)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 w-8"
                            onClick={() => setRatingToDelete(rating.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bewertung löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bist du sicher, dass du die Bewertung für "{rating.animeTitle}" löschen möchtest?
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteRating}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedRatings;
