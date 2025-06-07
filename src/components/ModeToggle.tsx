
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Get current theme, defaulting to 'light' if undefined
    const currentTheme = resolvedTheme || theme || 'light';
    console.log('Current theme before toggle:', currentTheme);
    
    if (currentTheme === "dark") {
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

  // Determine current theme with fallback
  const currentTheme = resolvedTheme || theme || 'light';
  const isDark = currentTheme === "dark";

  console.log('Rendering ModeToggle - current theme:', currentTheme, 'isDark:', isDark);

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
