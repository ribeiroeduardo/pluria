'use client';

import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCurrency } from '@/contexts/CurrencyContext';
export function CurrencyToggle() {
  const {
    currentCurrency,
    setCurrentCurrency
  } = useCurrency();
  return <div className="flex flex-col items-center">
      <ToggleGroup type="single" value={currentCurrency} onValueChange={value => value && setCurrentCurrency(value as 'USD' | 'BRL')} className="text-[10px]">
        <ToggleGroupItem value="USD" aria-label="US Dollar" className="px-2 py-1 h-6 text-xs">
          USD
        </ToggleGroupItem>
        <ToggleGroupItem value="BRL" aria-label="Brazilian Real" className="px-2 py-1 h-6">
          BRL
        </ToggleGroupItem>
      </ToggleGroup>
    </div>;
}