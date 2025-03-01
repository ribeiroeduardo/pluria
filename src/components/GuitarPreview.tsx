import React, { useEffect, useRef } from 'react';
import { useGuitarConfig } from '@/contexts/GuitarConfigContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { CurrencyToggle } from './CurrencyToggle';
import { ThemeToggle } from './ThemeToggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GuitarView } from '@/types/guitar';

interface GuitarPreviewProps {
  className?: string;
}

export const GuitarPreview = ({ className }: GuitarPreviewProps) => {
  const { configuration, imageLayers, currentView, theme, setCurrentView } = useGuitarConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Filter layers based on current view
  const frontLayers = imageLayers.filter(layer => {
    return layer.view === 'front' || layer.view === 'both' || layer.view === null;
  });

  const backLayers = imageLayers.filter(layer => {
    return layer.view === 'back' || layer.view === 'both' || layer.view === null;
  });

  return (
    <div className={cn(
      isMobile ? "fixed inset-0" : "fixed top-0 right-0 w-[65%] h-screen",
      "flex items-center justify-center bg-[#4D4C46] transition-colors duration-500 ease-in-out",
      className
    )}>
      {/* Front/Back Toggle */}
      <div className="absolute top-4 right-4 z-50">
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

      {/* Currency Toggle */}
      <div className="absolute bottom-4 left-4 z-50">
        <CurrencyToggle />
      </div>

      {/* Theme Toggle */}
      <div className="absolute bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Guitar Preview */}
      <div ref={containerRef} className={cn(
        "relative w-full h-full flex items-center justify-center p-8 transition-colors duration-500 ease-in-out",
        theme === 'dark' ? 'bg-[#171717]' : 'bg-[#e2e2e2]'
      )}>
        <div className="relative w-full h-full max-w-2xl max-h-2xl select-none">
          {frontLayers.length === 0 && backLayers.length === 0 && (
            <div className={cn(
              "absolute inset-0 flex items-center justify-center text-xl transition-colors duration-500 ease-in-out",
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            )}>
              No layers to display
            </div>
          )}
          
          {/* Front View Layers */}
          <div 
            className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out" 
            style={{ 
              opacity: currentView === 'front' ? 1 : 0,
              pointerEvents: currentView === 'front' ? 'auto' : 'none'
            }}
          >
            {frontLayers.map(layer => layer.url && (
              <img 
                key={layer.optionId}
                src={layer.url}
                alt={`Layer ${layer.optionId}`}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: layer.zIndex }}
                onError={e => {
                  console.error(`Failed to load layer ${layer.optionId}`);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
            
            {/* Shadow lighting layer - only show in front view */}
            {frontLayers.length > 0 && frontLayers.every(layer => !layer.url || layer.isVisible) && (
              <img
                src="/images/omni-lighting-sombra-corpo.png"
                alt="Shadow lighting effect"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 998, mixBlendMode: 'multiply' }}
                onError={e => {
                  console.error("Failed to load shadow lighting image");
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            
            {/* Light lighting layer - only show in front view */}
            {frontLayers.length > 0 && frontLayers.every(layer => !layer.url || layer.isVisible) && (
              <img
                src="/images/omni-lighting-luz-corpo.png"
                alt="Light lighting effect"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 999, mixBlendMode: 'soft-light' }}
                onError={e => {
                  console.error("Failed to load light lighting image");
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          
          {/* Back View Layers */}
          <div 
            className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out" 
            style={{ 
              opacity: currentView === 'back' ? 1 : 0,
              pointerEvents: currentView === 'back' ? 'auto' : 'none'
            }}
          >
            {backLayers.map(layer => layer.url && (
              <img 
                key={layer.optionId}
                src={layer.url}
                alt={`Layer ${layer.optionId}`}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: layer.zIndex }}
                onError={e => {
                  console.error(`Failed to load layer ${layer.optionId}`);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
            
            {/* Shadow layer for back view */}
            {backLayers.length > 0 && backLayers.every(layer => !layer.url || layer.isVisible) && (
              <img
                src="/images/omni-lighting-corpo-verso-sombra.png"
                alt="Shadow effect"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 998, mixBlendMode: 'multiply' }}
                onError={e => {
                  console.error("Failed to load shadow image");
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            
            {/* Light layer for back view */}
            {backLayers.length > 0 && backLayers.every(layer => !layer.url || layer.isVisible) && (
              <img
                src="/images/omni-lighting-corpo-verso-luz.png"
                alt="Light effect for back view"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 999, mixBlendMode: 'soft-light' }}
                onError={e => {
                  console.error("Failed to load back view lighting image");
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};