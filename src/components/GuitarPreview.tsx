
import React, { useEffect, useRef, useState } from 'react';
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
  const { configuration, imageLayers, currentView, theme, setCurrentView, loading } = useGuitarConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const frontLayersRef = useRef<HTMLImageElement[]>([]);
  const backLayersRef = useRef<HTMLImageElement[]>([]);
  const lightingLayersRef = useRef<HTMLImageElement[]>([]);

  // Filter layers based on current view
  const frontLayers = imageLayers.filter(layer => {
    return layer.view === 'front' || layer.view === 'both' || layer.view === null;
  });

  const backLayers = imageLayers.filter(layer => {
    return layer.view === 'back' || layer.view === 'both' || layer.view === null;
  });

  // Track image loading status
  useEffect(() => {
    if (loading || (frontLayers.length === 0 && backLayers.length === 0)) {
      setLoadingImages(true);
      setImagesLoaded(false);
      return;
    }

    // Reset image loading state when configuration changes
    setLoadingImages(true);
    setImagesLoaded(false);
    
    // Function to check if all images are loaded
    const checkAllImagesLoaded = () => {
      // Check if all visible layer images for the current view are loaded
      const layersToCheck = currentView === 'front' ? frontLayersRef.current : backLayersRef.current;
      const lightingLayersToCheck = lightingLayersRef.current;
      
      const allLayersLoaded = layersToCheck.every(img => img && img.complete);
      const allLightingLoaded = lightingLayersToCheck.every(img => img && img.complete);
      
      if (allLayersLoaded && allLightingLoaded) {
        setImagesLoaded(true);
        setLoadingImages(false);
      }
    };

    // Small delay to allow the DOM to update with new image elements
    const timer = setTimeout(() => {
      checkAllImagesLoaded();
    }, 100);

    return () => clearTimeout(timer);
  }, [frontLayers.length, backLayers.length, loading, currentView]);

  // Modern preloader component with gradient spinner
  const GuitarPreloader = () => (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center transition-colors duration-500 ease-in-out",
      theme === 'dark' ? 'text-white' : 'text-zinc-900'
    )}>
      {/* Modern gradient spinner */}
      <div className="relative w-14 h-14 mb-5">
        <div className="absolute inset-0 rounded-full animate-spin" 
             style={{ 
               borderWidth: '3px', 
               borderStyle: 'solid',
               borderColor: 'transparent',
               borderTopColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
               borderRightColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
               borderBottomColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
               animationDuration: '0.8s'
             }}></div>
      </div>
      <div className="text-sm font-medium tracking-wide">Loading</div>
    </div>
  );

  // Handle individual image load events
  const handleImageLoad = (ref: React.MutableRefObject<HTMLImageElement[]>, index: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    ref.current[index] = e.currentTarget;
    
    // Check if all images are loaded
    const frontLayersLoaded = frontLayersRef.current.every(img => img && img.complete);
    const backLayersLoaded = backLayersRef.current.every(img => img && img.complete);
    const lightingLayersLoaded = lightingLayersRef.current.every(img => img && img.complete);
    
    if ((currentView === 'front' && frontLayersLoaded && lightingLayersLoaded) || 
        (currentView === 'back' && backLayersLoaded && lightingLayersLoaded)) {
      setImagesLoaded(true);
      setLoadingImages(false);
    }
  };

  // Handle image load errors
  const handleImageError = (ref: React.MutableRefObject<HTMLImageElement[]>, index: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Failed to load image`);
    e.currentTarget.style.display = 'none';
    // Still mark this image as "loaded" even though it failed
    ref.current[index] = e.currentTarget;
    
    // Check if all images are loaded (including this failed one)
    const frontLayersLoaded = frontLayersRef.current.every(img => img && img.complete);
    const backLayersLoaded = backLayersRef.current.every(img => img && img.complete);
    const lightingLayersLoaded = lightingLayersRef.current.every(img => img && img.complete);
    
    if ((currentView === 'front' && frontLayersLoaded && lightingLayersLoaded) || 
        (currentView === 'back' && backLayersLoaded && lightingLayersLoaded)) {
      setImagesLoaded(true);
      setLoadingImages(false);
    }
  };

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
          onValueChange={value => {
            if (value) {
              // Reset loading state when view changes
              setImagesLoaded(false);
              setLoadingImages(true);
              setCurrentView(value as GuitarView);
            }
          }} 
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
          {(loading || loadingImages || (frontLayers.length === 0 && backLayers.length === 0)) && (
            <GuitarPreloader />
          )}
          
          {/* Front View Layers */}
          <div 
            className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out" 
            style={{ 
              opacity: (currentView === 'front' && imagesLoaded) ? 1 : 0,
              pointerEvents: currentView === 'front' ? 'auto' : 'none',
              visibility: (currentView === 'front' && imagesLoaded) ? 'visible' : 'hidden'
            }}
          >
            {frontLayers.map((layer, index) => layer.url && (
              <img 
                key={`front-${layer.optionId}-${index}`}
                src={layer.url}
                alt={`Layer ${layer.optionId}`}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ 
                  zIndex: layer.zIndex,
                  visibility: imagesLoaded ? 'visible' : 'hidden'
                }}
                onLoad={handleImageLoad(frontLayersRef, index)}
                onError={handleImageError(frontLayersRef, index)}
              />
            ))}
            
            {/* Shadow lighting layer - only show in front view */}
            {frontLayers.length > 0 && frontLayers.every(layer => !layer.url || layer.isVisible) && (
              <img
                src="/images/omni-lighting-sombra-corpo.png"
                alt="Shadow lighting effect"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ 
                  zIndex: 998, 
                  mixBlendMode: 'multiply',
                  visibility: imagesLoaded ? 'visible' : 'hidden'
                }}
                onLoad={handleImageLoad(lightingLayersRef, 0)}
                onError={handleImageError(lightingLayersRef, 0)}
              />
            )}
            
            {/* Light lighting layer - only show in front view */}
            {frontLayers.length > 0 && frontLayers.every(layer => !layer.url || layer.isVisible) && (
              <img
                src="/images/omni-lighting-luz-corpo.png"
                alt="Light lighting effect"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ 
                  zIndex: 999, 
                  mixBlendMode: 'soft-light',
                  visibility: imagesLoaded ? 'visible' : 'hidden'
                }}
                onLoad={handleImageLoad(lightingLayersRef, 1)}
                onError={handleImageError(lightingLayersRef, 1)}
              />
            )}
          </div>
          
          {/* Back View Layers */}
          <div 
            className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out" 
            style={{ 
              opacity: (currentView === 'back' && imagesLoaded) ? 1 : 0,
              pointerEvents: currentView === 'back' ? 'auto' : 'none',
              visibility: (currentView === 'back' && imagesLoaded) ? 'visible' : 'hidden'
            }}
          >
            {backLayers.map((layer, index) => layer.url && (
              <img 
                key={`back-${layer.optionId}-${index}`}
                src={layer.url}
                alt={`Layer ${layer.optionId}`}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ 
                  zIndex: layer.zIndex,
                  visibility: imagesLoaded ? 'visible' : 'hidden'
                }}
                onLoad={handleImageLoad(backLayersRef, index)}
                onError={handleImageError(backLayersRef, index)}
              />
            ))}
            
            {/* Shadow layer for back view */}
            {backLayers.length > 0 && backLayers.every(layer => !layer.url || layer.isVisible) && (
              <img
                src="/images/omni-lighting-corpo-verso-sombra.png"
                alt="Shadow effect"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ 
                  zIndex: 998, 
                  mixBlendMode: 'multiply',
                  visibility: imagesLoaded ? 'visible' : 'hidden'
                }}
                onLoad={handleImageLoad(lightingLayersRef, 2)}
                onError={handleImageError(lightingLayersRef, 2)}
              />
            )}
            
            {/* Light layer for back view */}
            {backLayers.length > 0 && backLayers.every(layer => !layer.url || layer.isVisible) && (
              <img
                src="/images/omni-lighting-corpo-verso-luz.png"
                alt="Light effect for back view"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ 
                  zIndex: 999, 
                  mixBlendMode: 'soft-light',
                  visibility: imagesLoaded ? 'visible' : 'hidden'
                }}
                onLoad={handleImageLoad(lightingLayersRef, 3)}
                onError={handleImageError(lightingLayersRef, 3)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
