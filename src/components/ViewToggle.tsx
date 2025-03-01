import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useGuitarConfig } from '@/contexts/GuitarConfigContext';
import { GuitarView } from '@/types/guitar';
import { cn } from '@/lib/utils';

export function ViewToggle() {
  const { currentView, setCurrentView, theme } = useGuitarConfig();

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col items-center">
      <ToggleGroup 
        type="single" 
        value={currentView} 
        onValueChange={value => value && setCurrentView(value as GuitarView)} 
        className={cn(
          "text-[10px] rounded-md",
          theme === 'light' 
            ? 'bg-white border-zinc-200 shadow-sm' 
            : 'bg-zinc-800 border-zinc-700'
        )}
      >
        <ToggleGroupItem 
          value="front" 
          aria-label="Front view" 
          className={cn(
            "px-2 py-1 h-6 text-xs rounded-sm transition-colors",
            theme === 'light' 
              ? 'text-zinc-600 hover:bg-zinc-100 data-[state=on]:bg-zinc-100 data-[state=on]:text-zinc-900' 
              : 'text-zinc-400 hover:bg-zinc-700 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100'
          )}
        >
          Front
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="back" 
          aria-label="Back view" 
          className={cn(
            "px-2 py-1 h-6 text-xs rounded-sm transition-colors",
            theme === 'light' 
              ? 'text-zinc-600 hover:bg-zinc-100 data-[state=on]:bg-zinc-100 data-[state=on]:text-zinc-900' 
              : 'text-zinc-400 hover:bg-zinc-700 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100'
          )}
        >
          Back
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}