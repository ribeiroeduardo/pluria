import React, { useEffect, useRef } from 'react'
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

interface GuitarPreviewProps {
  className?: string
}

export const GuitarPreview = ({ className }: GuitarPreviewProps) => {
  const { configuration, imageLayers } = useGuitarConfig()
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

  return (
    <div className={cn(
      isMobile 
        ? "fixed inset-0 bg-background"
        : "fixed top-0 right-0 w-[65%] h-screen bg-background",
      "flex items-center justify-center",
      className
    )}>
      {/* Guitar Preview */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center p-8"
        style={{ transition: 'transform 0.1s ease-out' }}
      >
        <div className="relative w-full h-full max-w-2xl max-h-2xl select-none">
          {imageLayers.map((layer) => (
            layer.url && (
              <img
                key={layer.optionId}
                src={layer.url}
                alt={`Layer ${layer.optionId}`}
                className={cn(
                  "absolute inset-0 w-full h-full object-contain transition-opacity duration-300",
                  !layer.isVisible && "opacity-0"
                )}
                style={{ zIndex: layer.zIndex }}
              />
            )
          ))}
          {/* Lighting layer only shows after all layers are loaded */}
          {imageLayers.length > 0 && imageLayers.every(layer => !layer.url || layer.isVisible) && (
            <img
              src="/images/omni-lighting-corpo.png"
              alt="Lighting effect"
              className="absolute inset-0 w-full h-full object-contain"
              style={{ zIndex: 999 }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
