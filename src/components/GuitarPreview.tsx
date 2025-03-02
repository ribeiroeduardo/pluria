
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
  
  // Create refs for tracking loaded images
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const pendingImages = useRef<Set<string>>(new Set());
  
  // Filter layers based on current view
  const currentLayers = imageLayers.filter(layer => {
    return (currentView === 'front' && (layer.view === 'front' || layer.view === 'both' || layer.view === null)) ||
           (currentView === 'back' && (layer.view === 'back' || layer.view === 'both' || layer.view === null));
  });

  // Reset loading state when configuration or view changes
  useEffect(() => {
    if (loading || currentLayers.length === 0) {
      setLoadingImages(true);
      setImagesLoaded(false);
      return;
    }

    // Reset image loading tracking
    setLoadingImages(true);
    setImagesLoaded(false);
    imageRefs.current.clear();
    pendingImages.current.clear();
    
    // Create a list of all images that need to be loaded
    const allImageUrls = new Set<string>();
    
    // Add guitar component layers
    currentLayers.forEach(layer => {
      if (layer.url) {
        allImageUrls.add(layer.url);
      }
    });
    
    // Add lighting effect images
    if (currentView === 'front') {
      allImageUrls.add('/images/omni-lighting-sombra-corpo.png');
      allImageUrls.add('/images/omni-lighting-luz-corpo.png');
    } else {
      allImageUrls.add('/images/omni-lighting-corpo-verso-sombra.png');
      allImageUrls.add('/images/omni-lighting-corpo-verso-luz.png');
    }
    
    // Store the list of images we're waiting for
    pendingImages.current = allImageUrls;
    
    // Pre-load all images at once
    const preloadPromises = Array.from(allImageUrls).map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageRefs.current.set(url, img);
          pendingImages.current.delete(url);
          
          // Check if all images are loaded
          if (pendingImages.current.size === 0) {
            setImagesLoaded(true);
            setLoadingImages(false);
          }
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          pendingImages.current.delete(url);
          
          // Check if all images are loaded (even if some failed)
          if (pendingImages.current.size === 0) {
            setImagesLoaded(true);
            setLoadingImages(false);
          }
          reject();
        };
        img.src = url;
      });
    });
    
    // Use Promise.allSettled to handle both successful and failed loads
    Promise.allSettled(preloadPromises).then(() => {
      // Double check that we've processed all images
      if (pendingImages.current.size === 0) {
        setImagesLoaded(true);
        setLoadingImages(false);
      }
    });
    
  }, [currentLayers.length, loading, currentView, currentLayers]);

  // Modern preloader component with gradient spinner
  const GuitarPreloader = () => (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center transition-colors duration-500 ease-in-out z-50",
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
          {/* Show loading indicator until all images are fully loaded */}
          {(loading || loadingImages || !imagesLoaded || currentLayers.length === 0) && (
            <GuitarPreloader />
          )}
          
          {/* Only render when ALL images are loaded */}
          {imagesLoaded && !loading && currentLayers.length > 0 && (
            <>
              {/* Front View */}
              <div 
                className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out" 
                style={{ 
                  opacity: currentView === 'front' ? 1 : 0,
                  pointerEvents: currentView === 'front' ? 'auto' : 'none',
                  visibility: currentView === 'front' ? 'visible' : 'hidden'
                }}
              >
                {/* Guitar Component Layers */}
                {currentLayers.filter(layer => 
                  (layer.view === 'front' || layer.view === 'both' || layer.view === null)
                ).map((layer, index) => layer.url && (
                  <img 
                    key={`front-${layer.optionId}-${index}`}
                    src={layer.url}
                    alt={`Layer ${layer.optionId}`}
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ zIndex: layer.zIndex }}
                  />
                ))}
                
                {/* Shadow lighting layer - only show in front view */}
                <img
                  src="/images/omni-lighting-sombra-corpo.png"
                  alt="Shadow lighting effect"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ 
                    zIndex: 998, 
                    mixBlendMode: 'multiply'
                  }}
                />
                
                {/* Light lighting layer - only show in front view */}
                <img
                  src="/images/omni-lighting-luz-corpo.png"
                  alt="Light lighting effect"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ 
                    zIndex: 999, 
                    mixBlendMode: 'soft-light'
                  }}
                />
              </div>
              
              {/* Back View */}
              <div 
                className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out" 
                style={{ 
                  opacity: currentView === 'back' ? 1 : 0,
                  pointerEvents: currentView === 'back' ? 'auto' : 'none',
                  visibility: currentView === 'back' ? 'visible' : 'hidden'
                }}
              >
                {/* Guitar Component Layers */}
                {currentLayers.filter(layer => 
                  (layer.view === 'back' || layer.view === 'both' || layer.view === null)
                ).map((layer, index) => layer.url && (
                  <img 
                    key={`back-${layer.optionId}-${index}`}
                    src={layer.url}
                    alt={`Layer ${layer.optionId}`}
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ zIndex: layer.zIndex }}
                  />
                ))}
                
                {/* Shadow layer for back view */}
                <img
                  src="/images/omni-lighting-corpo-verso-sombra.png"
                  alt="Shadow effect"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ 
                    zIndex: 998, 
                    mixBlendMode: 'multiply'
                  }}
                />
                
                {/* Light layer for back view */}
                <img
                  src="/images/omni-lighting-corpo-verso-luz.png"
                  alt="Light effect for back view"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ 
                    zIndex: 999, 
                    mixBlendMode: 'soft-light'
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
