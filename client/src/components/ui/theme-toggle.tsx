import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-12 h-6 rounded-full bg-sakura-200 dark:bg-sakura-700 relative transition-colors duration-300"
    >
      <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white dark:bg-sakura-800 dark:left-7 transition-all duration-300 flex items-center justify-center text-[0.6rem]">
        {theme === 'light' ? (
          <Sun className="h-3 w-3" />
        ) : (
          <Moon className="h-3 w-3" />
        )}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
