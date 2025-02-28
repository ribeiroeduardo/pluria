import React, { useEffect, useRef } from 'react'
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { ViewToggle } from './ViewToggle'

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
          
          {/* Lighting layer only shows after all layers are loaded */}
          {visibleLayers.length > 0 && visibleLayers.every(layer => !layer.url || layer.isVisible) && (
            <img
              src={currentView === 'front' ? "/images/omni-lighting-corpo.png" : "/images/omni-lighting-corpo-verso-luz.png"}
              alt="Lighting effect"
              className="absolute inset-0 w-full h-full object-contain"
              style={{ zIndex: 999, mixBlendMode: 'soft-light' }}
              onError={(e) => {
                console.error("Failed to load lighting image");
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
