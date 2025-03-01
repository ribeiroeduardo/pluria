'use client';

import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCurrency } from '@/contexts/CurrencyContext';

export function CurrencyToggle() {
  const { currentCurrency, setCurrentCurrency } = useCurrency();

  return (
    <div className="flex flex-col items-center">
      <ToggleGroup
        type="single"
        value={currentCurrency}
        onValueChange={(value) => value && setCurrentCurrency(value as 'USD' | 'BRL')}
      >
        <ToggleGroupItem value="USD" aria-label="US Dollar" className="px-4 py-2">
          USD
        </ToggleGroupItem>
        <ToggleGroupItem value="BRL" aria-label="Brazilian Real" className="px-4 py-2">
          BRL
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
} 