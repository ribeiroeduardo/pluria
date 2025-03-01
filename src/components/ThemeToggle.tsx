import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useGuitarConfig } from '@/contexts/GuitarConfigContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useGuitarConfig();

  return (
    <ToggleGroup 
      type="single" 
      value={theme} 
      onValueChange={value => value && setTheme(value as 'light' | 'dark')} 
      className={cn(
        "text-[10px] rounded-md",
        theme === 'light' 
          ? 'bg-white border-zinc-200 shadow-sm' 
          : 'bg-zinc-800 border-zinc-700'
      )}
    >
      <ToggleGroupItem 
        value="light" 
        aria-label="Light theme" 
        className={cn(
          "px-2 py-1 h-6 rounded-sm transition-colors",
          theme === 'light' 
            ? 'text-zinc-600 hover:bg-zinc-100 data-[state=on]:bg-zinc-100 data-[state=on]:text-zinc-900' 
            : 'text-zinc-400 hover:bg-zinc-700 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100'
        )}
      >
        <Sun size={14} />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="dark" 
        aria-label="Dark theme" 
        className={cn(
          "px-2 py-1 h-6 rounded-sm transition-colors",
          theme === 'light' 
            ? 'text-zinc-600 hover:bg-zinc-100 data-[state=on]:bg-zinc-100 data-[state=on]:text-zinc-900' 
            : 'text-zinc-400 hover:bg-zinc-700 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100'
        )}
      >
        <Moon size={14} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
} 