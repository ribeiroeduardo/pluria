'use client';

import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGuitarConfig } from '@/contexts/GuitarConfigContext';
import { cn } from '@/lib/utils';

export function CurrencyToggle() {
  const { currentCurrency, setCurrentCurrency } = useCurrency();
  const { theme } = useGuitarConfig();

  return (
    <ToggleGroup 
      type="single" 
      value={currentCurrency} 
      onValueChange={value => value && setCurrentCurrency(value as 'USD' | 'BRL')} 
      className={cn(
        "text-[10px] rounded-md",
        theme === 'light' 
          ? 'bg-white border-zinc-200 shadow-sm' 
          : 'bg-zinc-800 border-zinc-700'
      )}
    >
      <ToggleGroupItem 
        value="USD" 
        aria-label="US Dollar" 
        className={cn(
          "px-2 py-1 h-6 text-xs rounded-sm transition-colors",
          theme === 'light' 
            ? 'text-zinc-600 hover:bg-zinc-100 data-[state=on]:bg-zinc-100 data-[state=on]:text-zinc-900' 
            : 'text-zinc-400 hover:bg-zinc-700 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100'
        )}
      >
        USD
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="BRL" 
        aria-label="Brazilian Real" 
        className={cn(
          "px-2 py-1 h-6 text-xs rounded-sm transition-colors",
          theme === 'light' 
            ? 'text-zinc-600 hover:bg-zinc-100 data-[state=on]:bg-zinc-100 data-[state=on]:text-zinc-900' 
            : 'text-zinc-400 hover:bg-zinc-700 data-[state=on]:bg-zinc-700 data-[state=on]:text-zinc-100'
        )}
      >
        BRL
      </ToggleGroupItem>
    </ToggleGroup>
  );
}