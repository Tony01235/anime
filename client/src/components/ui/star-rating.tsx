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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (readOnly) return;
    
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    
    // Calculate the precise rating based on cursor position
    let value: number;
    if (precision === 0.5) {
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

  const handleClick = (value: number) => {
    if (readOnly) return;
    setRating(value);
    onChange?.(value);
  };

  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  const renderStar = (starIndex: number) => {
    const currentRating = hoverRating || rating;
    const starValue = starIndex + 1;
    const isActive = currentRating >= starValue;
    const isHalfActive = 
      precision === 0.5 && 
      currentRating === starIndex + 0.5;
    
    if (isHalfActive) {
      return (
        <div className="relative" key={`star-${starIndex}`}>
          <Star className={cn(getStarSize(), colorEmpty)} />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <Star className={cn(getStarSize(), colorFilled)} />
          </div>
        </div>
      );
    }
    
    return (
      <Star 
        key={`star-${starIndex}`}
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
          onClick={() => handleClick(i + 1)}
          onMouseMove={(e) => handleMouseMove(e, i)}
        >
          {renderStar(i)}
        </div>
      ))}
    </div>
  );
};

export default StarRating;
