
import React, { useEffect, useRef } from 'react'
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { ViewToggle } from './ViewToggle'
import { CurrencyToggle } from './CurrencyToggle'

interface GuitarPreviewProps {
  className?: string
}

export const GuitarPreview = ({ className }: GuitarPreviewProps) => {
  const { configuration, imageLayers, currentView } = useGuitarConfig()
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile || !containerRef.current) return

    const container = containerRef.current
    let bounds = container.getBoundingClientRect()

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX - bounds.left
      const mouseY = e.clientY - bounds.top
      
      const centerX = bounds.width / 2
      const centerY = bounds.height / 2
      
      const rotateX = (mouseY - centerY) / 100
      const rotateY = (centerX - mouseX) / 100

      container.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }

    const handleMouseLeave = () => {
      container.style.transform = 'perspective(2000px) rotateX(0deg) rotateY(0deg)'
    }

    const handleResize = () => {
      bounds = container.getBoundingClientRect()
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobile])

  console.log('Image Layers:', imageLayers);
  console.log('Current View:', currentView);

  // Filter layers based on current view
  const visibleLayers = imageLayers.filter(layer => {
    return layer.view === currentView || layer.view === 'both' || layer.view === null;
  });

  return (
    <div className={cn(
      isMobile 
        ? "fixed inset-0"
        : "fixed top-0 right-0 w-[65%] h-screen",
      "flex items-center justify-center bg-[#4D4C46]",
      className
    )}>
      {/* Currency Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <CurrencyToggle />
      </div>

      {/* Guitar Preview */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center p-8"
        style={{ transition: 'transform 0.1s ease-out' }}
      >
        <div className="relative w-full h-full max-w-2xl max-h-2xl select-none">
          {visibleLayers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
              
            </div>
          )}
          
          {visibleLayers.map((layer) => (
            layer.url &&
            <img
              key={layer.optionId}
              src={layer.url}
              alt={`Layer ${layer.optionId}`}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ zIndex: layer.zIndex }}
              onError={(e) => {
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
              onError={(e) => {
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
              onError={(e) => {
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
              onError={(e) => {
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
              onError={(e) => {
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
  )
}
