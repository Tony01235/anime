import React from 'react';
import { Link, useLocation } from 'wouter';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-sakura-900 shadow-md relative z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <svg 
                className="w-10 h-10 text-sakura-500 dark:text-sakura-300" 
                viewBox="0 0 40 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M20 5C20 5 15 10 15 15C15 18 17 20 20 20C23 20 25 18 25 15C25 10 20 5 20 5Z" 
                  fill="currentColor" 
                />
                <path 
                  d="M12 10C12 10 10 12 11 15C12 17 14 17 15 15C16 13 13 10 12 10Z" 
                  fill="currentColor" 
                />
                <path 
                  d="M28 10C28 10 30 12 29 15C28 17 26 17 25 15C24 13 27 10 28 10Z" 
                  fill="currentColor" 
                />
                <path 
                  d="M20 20C20 20 18 25 20 30C22 35 28 35 30 30C32 25 25 20 20 20Z" 
                  fill="currentColor" 
                />
                <path 
                  d="M20 20C20 20 12 25 10 30C8 35 12 37 17 35C22 33 20 20 20 20Z" 
                  fill="currentColor" 
                />
              </svg>
              <h1 className="ml-5 text-2xl font-bold text-sakura-500 dark:text-sakura-300 font-sans">
                Anime Sakura
              </h1>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/saved">
              <Button 
                variant="ghost" 
                className={`text-sm font-medium ${
                  location === '/saved' 
                    ? 'text-sakura-500 dark:text-sakura-400' 
                    : 'text-sakura-600 dark:text-sakura-300 hover:text-sakura-500 dark:hover:text-sakura-200'
                }`}
              >
                <Bookmark className="mr-1 h-4 w-4" /> Gespeichert
              </Button>
            </Link>
            
            <ThemeToggle />
          </div>
        </div>
        
        {/* Decorative cherry blossoms */}
        <div className="absolute top-0 left-0 w-20 h-20 opacity-20 pointer-events-none">
          <svg className="w-full h-full text-sakura-500 dark:text-sakura-300" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10C50 10 40 20 40 30C40 35 45 40 50 40C55 40 60 35 60 30C60 20 50 10 50 10Z" />
            <path d="M30 20C30 20 20 30 25 40C28 45 35 45 40 40C45 35 35 20 30 20Z" />
            <path d="M70 20C70 20 80 30 75 40C72 45 65 45 60 40C55 35 65 20 70 20Z" />
            <path d="M40 40C40 40 30 50 30 60C30 70 40 75 50 70C60 65 50 40 40 40Z" />
            <path d="M60 40C60 40 70 50 70 60C70 70 60 75 50 70C40 65 50 40 60 40Z" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 opacity-20 pointer-events-none">
          <svg className="w-full h-full text-sakura-500 dark:text-sakura-300" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10C50 10 40 20 40 30C40 35 45 40 50 40C55 40 60 35 60 30C60 20 50 10 50 10Z" />
            <path d="M30 20C30 20 20 30 25 40C28 45 35 45 40 40C45 35 35 20 30 20Z" />
            <path d="M70 20C70 20 80 30 75 40C72 45 65 45 60 40C55 35 65 20 70 20Z" />
            <path d="M40 40C40 40 30 50 30 60C30 70 40 75 50 70C60 65 50 40 40 40Z" />
            <path d="M60 40C60 40 70 50 70 60C70 70 60 75 50 70C40 65 50 40 60 40Z" />
          </svg>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-sakura-900 py-4 border-t border-sakura-100 dark:border-sakura-800">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-sakura-300">
          <p>© {new Date().getFullYear()} Anime Sakura | Deine Anime-Bewertungen in einem wunderschönen Design</p>
          <div className="flex justify-center mt-2 space-x-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sakura-400 dark:text-sakura-300 hover:text-sakura-500 dark:hover:text-sakura-200"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
