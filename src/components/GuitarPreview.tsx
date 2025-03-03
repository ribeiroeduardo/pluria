import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGuitarConfig } from '@/contexts/GuitarConfigContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { CurrencyToggle } from './CurrencyToggle';
import { ThemeToggle } from './ThemeToggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GuitarView } from '@/types/guitar';

// Add a new interface for the image cache
interface ImageCache {
  front: Map<string, HTMLImageElement>;
  back: Map<string, HTMLImageElement>;
  lighting: Map<string, HTMLImageElement>;
}

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
  const [debugCounter, setDebugCounter] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add image cache ref
  const imageCacheRef = useRef<ImageCache>({
    front: new Map(),
    back: new Map(),
    lighting: new Map()
  });

  // Filter layers based on current view
  const frontLayers = imageLayers.filter(layer => {
    return layer.view === 'front' || layer.view === 'both' || layer.view === null;
  });

  const backLayers = imageLayers.filter(layer => {
    return layer.view === 'back' || layer.view === 'both' || layer.view === null;
  });

  // Create a memoized function to get image from cache or load it
  const getOrLoadImage = useCallback((url: string, viewType: 'front' | 'back' | 'lighting'): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      // Check if the image is already in the cache
      const cache = imageCacheRef.current[viewType];
      if (cache.has(url)) {
        console.log(`[DEBUG] Using cached image for ${url}`);
        resolve(cache.get(url)!);
        return;
      }

      // If not in cache, load the image
      console.log(`[DEBUG] Loading new image for ${url}`);
      const img = new Image();
      
      img.onload = () => {
        // Add to cache when loaded
        cache.set(url, img);
        console.log(`[DEBUG] Successfully loaded and cached: ${url}`);
        resolve(img);
      };
      
      img.onerror = (e) => {
        console.error(`[DEBUG] Failed to load: ${url}`, e);
        reject(e);
      };
      
      img.src = url;
    });
  }, []);

  // Track image loading status - this is the critical function we need to fix
  useEffect(() => {
    if (loading || (frontLayers.length === 0 && backLayers.length === 0)) {
      setLoadingImages(true);
      setImagesLoaded(false);
      console.log('[DEBUG] Reset loading state: No layers available or still loading');
      return;
    }

    // Reset image loading state when configuration changes
    setLoadingImages(true);
    setImagesLoaded(false);
    
    // Clear the previous references when view changes
    frontLayersRef.current = [];
    backLayersRef.current = [];
    lightingLayersRef.current = [];
    
    // Debug log
    console.log(`[DEBUG] View changed to ${currentView}. Front layers: ${frontLayers.length}, Back layers: ${backLayers.length}`);
    
    // Set a safety timeout to prevent infinite loading
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (!imagesLoaded && loadingImages) {
        console.log('[DEBUG] Safety timeout triggered - forcing images to show after 10 seconds');
        setImagesLoaded(true);
        setLoadingImages(false);
      }
    }, 10000); // 10 second timeout
    
    // Don't mark as loaded until explicit check confirms all images are loaded
  }, [frontLayers.length, backLayers.length, loading, currentView]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      <div className="text-xs mt-2 opacity-50">Debug: {debugCounter}</div>
    </div>
  );

  // Function to check if all relevant images are loaded
  const checkAllImagesLoaded = () => {
    const layersToCheck = currentView === 'front' ? frontLayersRef.current : backLayersRef.current;
    const lightingLayersToCheck = lightingLayersRef.current;
    
    // Get the expected number of layers for the current view
    const expectedLayerCount = currentView === 'front' ? frontLayers.length : backLayers.length;
    const expectedLightingLayerCount = currentView === 'front' ? 2 : 2; // 2 lighting layers for each view
    
    // Check if we have loaded references for all expected layers
    const hasAllLayerRefs = layersToCheck.length === expectedLayerCount;
    const hasAllLightingRefs = lightingLayersToCheck.length === expectedLightingLayerCount;
    
    // Check if all loaded references are actually complete
    const allLayersLoaded = hasAllLayerRefs && layersToCheck.every(img => img && img.complete);
    const allLightingLoaded = hasAllLightingRefs && lightingLayersToCheck.every(img => img && img.complete);
    
    // Increment debug counter
    setDebugCounter(prev => prev + 1);
    
    console.log(`Checking loaded status: Layers ${layersToCheck.length}/${expectedLayerCount}, Lighting ${lightingLayersToCheck.length}/${expectedLightingLayerCount}`);
    console.log(`All layers loaded: ${allLayersLoaded}, All lighting loaded: ${allLightingLoaded}`);
    
    // Log detailed information about lighting layers
    if (lightingLayersToCheck.length > 0) {
      lightingLayersToCheck.forEach((img, idx) => {
        if (img) {
          console.log(`Lighting image ${idx}: ${img.src}, complete: ${img.complete}, naturalWidth: ${img.naturalWidth}, naturalHeight: ${img.naturalHeight}`);
        } else {
          console.log(`Lighting image ${idx}: Not loaded yet`);
        }
      });
    } else {
      console.log(`No lighting images loaded yet`);
    }
    
    // Modified condition: If we have at least some layers loaded or if we've been trying for a while, show the guitar
    const minimumLayersLoaded = layersToCheck.length > 0 && lightingLayersToCheck.length > 0;
    const shouldForceShow = debugCounter > 20; // Force show after ~20 checks
    
    if (allLayersLoaded && allLightingLoaded) {
      console.log('[DEBUG] All images loaded normally, showing guitar');
      setImagesLoaded(true);
      setLoadingImages(false);
      // Clear the safety timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else if (minimumLayersLoaded && shouldForceShow) {
      console.log('[DEBUG] Forcing guitar to show after multiple attempts');
      setImagesLoaded(true);
      setLoadingImages(false);
      // Clear the safety timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  // Handle individual image load events
  const handleImageLoad = (ref: React.MutableRefObject<HTMLImageElement[]>, index: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Store the loaded image in the appropriate reference array
    ref.current[index] = e.currentTarget;
    console.log(`[DEBUG] Image loaded: ${e.currentTarget.src} (${ref === frontLayersRef ? 'front' : ref === backLayersRef ? 'back' : 'lighting'} index ${index})`);
    
    // Check if all images are loaded
    checkAllImagesLoaded();
  };

  // Handle image load errors
  const handleImageError = (ref: React.MutableRefObject<HTMLImageElement[]>, index: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`[DEBUG] Failed to load image: ${e.currentTarget.src}`);
    console.error(`[DEBUG] Error details: ${e.currentTarget.naturalWidth}x${e.currentTarget.naturalHeight}, complete: ${e.currentTarget.complete}`);
    e.currentTarget.style.display = 'none';
    // Still mark this image as "loaded" even though it failed
    ref.current[index] = e.currentTarget;
    
    // Check if all images are loaded (including this failed one)
    checkAllImagesLoaded();
  };

  // Improved preload function using the cache
  useEffect(() => {
    const preloadImages = async () => {
      const imagesToPreload = currentView === 'front' ? frontLayers : backLayers;
      const lightingImageUrls = currentView === 'front' 
        ? ['/images/omni-lighting-sombra-corpo.png', '/images/omni-lighting-luz-corpo.png']
        : ['/images/omni-lighting-corpo-verso-sombra.png', '/images/omni-lighting-corpo-verso-luz.png'];
      
      console.log(`[DEBUG] Preloading ${imagesToPreload.length} ${currentView} layers and ${lightingImageUrls.length} lighting images`);
      
      // Check if we already have all images in cache
      const viewCache = imageCacheRef.current[currentView === 'front' ? 'front' : 'back'];
      const lightingCache = imageCacheRef.current.lighting;
      
      const allLayersInCache = imagesToPreload.every(layer => layer.url && viewCache.has(layer.url));
      const allLightingInCache = lightingImageUrls.every(url => lightingCache.has(url));
      
      if (allLayersInCache && allLightingInCache) {
        console.log(`[DEBUG] All images already in cache, showing immediately`);
        
        // Populate the refs from cache
        imagesToPreload.forEach((layer, index) => {
          if (layer.url && viewCache.has(layer.url)) {
            const cachedImg = viewCache.get(layer.url)!;
            if (currentView === 'front') {
              frontLayersRef.current[index] = cachedImg;
            } else {
              backLayersRef.current[index] = cachedImg;
            }
          }
        });
        
        lightingImageUrls.forEach((url, index) => {
          if (lightingCache.has(url)) {
            lightingLayersRef.current[index] = lightingCache.get(url)!;
          }
        });
        
        // Show the guitar immediately
        setImagesLoaded(true);
        setLoadingImages(false);
        return;
      }
      
      // If not all in cache, load the missing ones
      const layerPromises = imagesToPreload.map((layer, index) => {
        if (layer.url) {
          return getOrLoadImage(layer.url, currentView === 'front' ? 'front' : 'back')
            .then(img => {
              if (currentView === 'front') {
                frontLayersRef.current[index] = img;
              } else {
                backLayersRef.current[index] = img;
              }
              return img;
            })
            .catch(err => {
              console.error(`[DEBUG] Error loading layer ${index}:`, err);
              return null;
            });
        }
        return Promise.resolve(null);
      });
      
      const lightingPromises = lightingImageUrls.map((url, index) => {
        return getOrLoadImage(url, 'lighting')
          .then(img => {
            lightingLayersRef.current[index] = img;
            return img;
          })
          .catch(err => {
            console.error(`[DEBUG] Error loading lighting ${index}:`, err);
            return null;
          });
      });
      
      // Wait for all images to load
      try {
        await Promise.all([...layerPromises, ...lightingPromises]);
        console.log('[DEBUG] All images loaded via Promise.all');
        checkAllImagesLoaded();
      } catch (error) {
        console.error('[DEBUG] Error loading images:', error);
        // Still check if we have enough to show
        checkAllImagesLoaded();
      }
    };
    
    if (!loading && (frontLayers.length > 0 || backLayers.length > 0)) {
      console.log(`[DEBUG] Starting preload process for ${currentView} view`);
      preloadImages();
    } else {
      console.log(`[DEBUG] Skipping preload: loading=${loading}, frontLayers=${frontLayers.length}, backLayers=${backLayers.length}`);
    }
  }, [frontLayers, backLayers, loading, currentView, getOrLoadImage]);

  // Add a fallback mechanism for lighting images
  useEffect(() => {
    // If we've been waiting for lighting images for too long, force completion
    const lightingTimeout = setTimeout(() => {
      const lightingLayersToCheck = lightingLayersRef.current;
      const expectedLightingLayerCount = currentView === 'front' ? 2 : 2;
      
      if (lightingLayersToCheck.length < expectedLightingLayerCount) {
        console.log(`[DEBUG] Lighting timeout triggered - forcing completion after waiting for lighting images`);
        
        // Create dummy image objects for missing lighting layers
        for (let i = 0; i < expectedLightingLayerCount; i++) {
          if (!lightingLayersToCheck[i]) {
            console.log(`[DEBUG] Creating dummy lighting image for index ${i}`);
            const dummyImg = new Image();
            dummyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 transparent GIF
            // Don't set complete property as it's read-only
            // Instead, manually trigger the load event after a short delay
            setTimeout(() => {
              dummyImg.dispatchEvent(new Event('load'));
            }, 50);
            lightingLayersRef.current[i] = dummyImg;
          }
        }
        
        // Force check all images loaded
        checkAllImagesLoaded();
      }
    }, 5000); // 5 second timeout for lighting images
    
    return () => {
      clearTimeout(lightingTimeout);
    };
  }, [currentView, lightingLayersRef.current.length]);

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
          {/* Always show loading indicator until images are fully loaded */}
          {(loading || loadingImages || !imagesLoaded || (frontLayers.length === 0 && backLayers.length === 0)) && (
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
                  visibility: imagesLoaded ? 'visible' : 'hidden',
                  mixBlendMode: (layer.mixBlendMode || undefined) as React.CSSProperties['mixBlendMode'],
                  opacity: layer.opacity
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
                  visibility: imagesLoaded ? 'visible' : 'hidden',
                  opacity: .7
                }}
                onLoad={(e) => {
                  console.log(`[DEBUG] Front shadow lighting loaded: ${e.currentTarget.src}, dimensions: ${e.currentTarget.naturalWidth}x${e.currentTarget.naturalHeight}`);
                  handleImageLoad(lightingLayersRef, 0)(e);
                }}
                onError={(e) => {
                  console.error(`[DEBUG] Front shadow lighting failed to load: ${e.currentTarget.src}`);
                  handleImageError(lightingLayersRef, 0)(e);
                }}
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
                  mixBlendMode: 'screen',
                  visibility: imagesLoaded ? 'visible' : 'hidden',
                  opacity: 0.5
                }}
                onLoad={(e) => {
                  console.log(`[DEBUG] Front light lighting loaded: ${e.currentTarget.src}, dimensions: ${e.currentTarget.naturalWidth}x${e.currentTarget.naturalHeight}`);
                  handleImageLoad(lightingLayersRef, 1)(e);
                }}
                onError={(e) => {
                  console.error(`[DEBUG] Front light lighting failed to load: ${e.currentTarget.src}`);
                  handleImageError(lightingLayersRef, 1)(e);
                }}
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
                  visibility: imagesLoaded ? 'visible' : 'hidden',
                  mixBlendMode: (layer.mixBlendMode || undefined) as React.CSSProperties['mixBlendMode'],
                  opacity: layer.opacity
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
                onLoad={(e) => {
                  console.log(`[DEBUG] Back shadow lighting loaded: ${e.currentTarget.src}, dimensions: ${e.currentTarget.naturalWidth}x${e.currentTarget.naturalHeight}`);
                  handleImageLoad(lightingLayersRef, 0)(e);
                }}
                onError={(e) => {
                  console.error(`[DEBUG] Back shadow lighting failed to load: ${e.currentTarget.src}`);
                  handleImageError(lightingLayersRef, 0)(e);
                }}
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
                onLoad={(e) => {
                  console.log(`[DEBUG] Back light lighting loaded: ${e.currentTarget.src}, dimensions: ${e.currentTarget.naturalWidth}x${e.currentTarget.naturalHeight}`);
                  handleImageLoad(lightingLayersRef, 1)(e);
                }}
                onError={(e) => {
                  console.error(`[DEBUG] Back light lighting failed to load: ${e.currentTarget.src}`);
                  handleImageError(lightingLayersRef, 1)(e);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
