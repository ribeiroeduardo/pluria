
import React from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useGuitarConfig } from '@/contexts/GuitarConfigContext';
import { GuitarView } from '@/types/guitar';

export function ViewToggle() {
  const { currentView, setCurrentView } = useGuitarConfig();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center">
      <ToggleGroup type="single" value={currentView} onValueChange={(value) => value && setCurrentView(value as GuitarView)}>
        <ToggleGroupItem value="front" aria-label="Front view" className="px-4 py-2">
          Front
        </ToggleGroupItem>
        <ToggleGroupItem value="back" aria-label="Back view" className="px-4 py-2">
          Back
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
