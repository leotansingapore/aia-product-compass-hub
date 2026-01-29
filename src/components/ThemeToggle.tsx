import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const root = document.documentElement;
    const currentTheme = root.classList.contains("dark");
    setIsDark(currentTheme);
    
    // Also check localStorage
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      root.classList.add("dark");
      setIsDark(true);
    } else if (stored === "light") {
      root.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const newIsDark = !isDark;
    
    if (newIsDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    setIsDark(newIsDark);
  };

  return (
    <Button
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      onClick={toggleTheme}
      className={showLabel ? "gap-2" : ""}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          {showLabel && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          {showLabel && <span>Dark Mode</span>}
        </>
      )}
    </Button>
  );
}
