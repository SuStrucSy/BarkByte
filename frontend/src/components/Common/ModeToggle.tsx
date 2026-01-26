import { Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";

const ModeToggle = () => {
  const { setMode, setTheme, theme } = useTheme();
  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setMode("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color Theme Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Palette className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle color theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme("neutral")}>
            <div className="mr-2 h-4 w-4 rounded-full bg-primary" />
            <span>Neutral</span>
            {theme === "neutral" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("stone")}>
            <div className="mr-2 h-4 w-4 rounded-full bg-stone-500" />
            <span>Stone</span>
            {theme === "stone" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("zinc")}>
            <div className="mr-2 h-4 w-4 rounded-full bg-zinc-500" />
            <span>zinc</span>
            {theme === "zinc" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("gray")}>
            <div className="mr-2 h-4 w-4 rounded-full bg-gray-500" />
            <span>Gray</span>
            {theme === "gray" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("slate")}>
            <div className="mr-2 h-4 w-4 rounded-full bg-slate-500" />
            <span>Slate</span>
            {theme === "slate" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ModeToggle;
