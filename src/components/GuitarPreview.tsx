import React, { useEffect, useRef } from 'react';
import { useGuitarConfig } from '@/contexts/GuitarConfigContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ViewToggle } from './ViewToggle';
import { CurrencyToggle } from './CurrencyToggle';
import { ThemeToggle } from './ThemeToggle';

interface GuitarPreviewProps {
  className?: string;
}

export const GuitarPreview = ({ className }: GuitarPreviewProps) => {
  const { configuration, imageLayers, currentView, theme } = useGuitarConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Filter layers based on current view
  const visibleLayers = imageLayers.filter(layer => {
    return layer.view === currentView || layer.view === 'both' || layer.view === null;
  });

  return (
    <div className={cn(
      isMobile ? "fixed inset-0" : "fixed top-0 right-0 w-[65%] h-screen",
      "flex items-center justify-center bg-[#4D4C46]",
      className
    )}>
      {/* Toggles */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <ThemeToggle />
        <CurrencyToggle />
      </div>

      {/* Guitar Preview */}
      <div ref={containerRef} className={cn(
        "relative w-full h-full flex items-center justify-center p-8",
        theme === 'dark' ? 'bg-[#171717]' : 'bg-zinc-100'
      )}>
        <div className="relative w-full h-full max-w-2xl max-h-2xl select-none">
          {visibleLayers.length === 0 && (
            <div className={cn(
              "absolute inset-0 flex items-center justify-center text-xl",
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            )}>
              No layers to display
            </div>
          )}
          
          {visibleLayers.map(layer => layer.url && (
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
          {currentView === 'back' && visibleLayers.length > 0 && visibleLayers.every(layer => !layer.url || layer.isVisible) && (
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
          {currentView === 'back' && visibleLayers.length > 0 && visibleLayers.every(layer => !layer.url || layer.isVisible) && (
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
          
          {/* Shadow lighting layer - only show in front view */}
          {currentView === 'front' && visibleLayers.length > 0 && visibleLayers.every(layer => !layer.url || layer.isVisible) && (
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
          {currentView === 'front' && visibleLayers.length > 0 && visibleLayers.every(layer => !layer.url || layer.isVisible) && (
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
      </div>
      
      {/* View Toggle Button */}
      <ViewToggle />
    </div>
  );
};