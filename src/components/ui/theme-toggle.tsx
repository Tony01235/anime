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
      className="w-12 h-6 rounded-full bg-sakura-200 dark:bg-sakura-700 relative transition-colors duration-300 overflow-visible z-20"
    >
      <div className="absolute w-full h-full inset-0 flex items-center justify-between px-1 pointer-events-none">
        <Sun className="h-4 w-4 text-sakura-600" />
        <Moon className="h-4 w-4 text-sakura-300" />
      </div>
      <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white dark:bg-sakura-800 dark:left-7 transition-all duration-300 z-10"></span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}