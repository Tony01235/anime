import React, { useState, useEffect } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  initialRating?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  precision?: 0.5 | 1;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
  colorFilled?: string;
  colorEmpty?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  initialRating = 0,
  max = 5,
  size = 'md',
  precision = 0.5,
  onChange,
  readOnly = false,
  className,
  colorFilled = 'text-sakura-400 dark:text-sakura-500',
  colorEmpty = 'text-gray-300 dark:text-gray-600'
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Update rating when initialRating prop changes
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  // Force update of the UI when rating changes
  useEffect(() => {
    setHoverRating(0);
  }, [rating]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (readOnly) return;
    
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    
    // Calculate the precise rating based on cursor position
    let value: number;
    if (precision === 0.5) {
      // Für halbe Sterne: < 0.5 = halber Stern, > 0.5 = ganzer Stern
      value = percent <= 0.5 ? starIndex + 0.5 : starIndex + 1;
    } else {
      value = starIndex + 1;
    }
    
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  const handleClick = (value: number, e?: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    
    // Halbe-Stern-Logik
    let newRating = value;
    
    // Wenn precision 0.5 ist und das vorherige Rating + 0.5 dem aktuellen Wert entspricht,
    // setze auf den vollen Stern, sonst setze auf den halben Stern
    if (precision === 0.5) {
      if (rating === value - 0.5) {
        // Wir hatten vorher einen halben Stern, jetzt vollen Stern
        newRating = value;
      } else if (rating === value) {
        // Wir hatten vorher einen vollen Stern, jetzt zurücksetzen (0)
        newRating = 0;
      } else {
        // Wir hatten etwas anderes, jetzt halber Stern
        newRating = value - 0.5;
      }
    }
    
    // Bei precision 1.0 (ganze Sterne)
    if (precision === 1 && rating === newRating) {
      newRating = 0;
    }
    
    setRating(newRating);
    // Setze unmittelbar hoverRating auch auf 0 beim Zurücksetzen
    if (newRating === 0) {
      setHoverRating(0);
    }
    
    onChange?.(newRating);
  };

  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  const renderStar = (starIndex: number) => {
    const currentRating = hoverRating || (rating > 0 ? rating : 0);
    const starValue = starIndex + 1;
    const isActive = currentRating >= starValue;
    const isHalfActive = 
      precision === 0.5 && 
      Math.ceil(currentRating) === starValue &&
      currentRating % 1 !== 0;

    if (isHalfActive) {
      return (
        <div className="relative inline-block">
          <Star className={cn(getStarSize(), colorEmpty)} />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <Star className={cn(getStarSize(), colorFilled)} />
          </div>
        </div>
      );
    }
    
    return (
      <Star 
        className={cn(
          getStarSize(),
          isActive ? colorFilled : colorEmpty,
          'transition-colors duration-200'
        )} 
      />
    );
  };

  return (
    <div 
      className={cn('flex items-center', className)}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={cn('cursor-pointer', { 'cursor-default': readOnly })}
          onClick={(e) => handleClick(i + 1, e)}
          onMouseMove={(e) => handleMouseMove(e, i)}
        >
          {renderStar(i)}
        </div>
      ))}
    </div>
  );
};

export default StarRating;
