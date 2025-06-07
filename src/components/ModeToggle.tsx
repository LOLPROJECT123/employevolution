
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    console.log('Current theme:', theme);
    // Handle theme switching with proper fallbacks
    if (theme === "dark") {
      setTheme("light");
      console.log('Switching to light theme');
    } else {
      setTheme("dark");
      console.log('Switching to dark theme');
    }
  };

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <div className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
