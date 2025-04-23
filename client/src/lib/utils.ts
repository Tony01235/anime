import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('de-DE', options);
};

// Convert category ratings (0-10) to overall rating (0-5)
export const calculateOverallRating = (categoryRatings: number[]): number => {
  if (!categoryRatings.length) return 0;
  
  // Alle Werte werden berücksichtigt, auch 0
  const sum = categoryRatings.reduce((acc, val) => acc + val, 0);
  const average = sum / categoryRatings.length;
  
  // Convert from 0-10 scale to 0-5 scale
  const overallRating = average / 2;
  
  // Round to nearest 0.5
  return Math.round(overallRating * 2) / 2;
};

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// For debouncing search input
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// Extract year from date string
export const extractYear = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.getFullYear().toString();
};
