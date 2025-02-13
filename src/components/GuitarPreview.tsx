import React from 'react'
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { cn } from '@/lib/utils'

interface GuitarPreviewProps {
  className?: string
}

export const GuitarPreview = ({ className }: GuitarPreviewProps) => {
  const { configuration, imageLayers } = useGuitarConfig()

  return (
    <div className={cn("flex-1 bg-background h-full relative overflow-hidden", className)}>
      {/* Guitar Preview */}
      <div className="h-full flex items-center justify-center p-8 overflow-hidden">
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
          {/* Lighting layer always on top */}
          <img
            src="/images/omni-lighting-corpo.png"
            alt="Lighting effect"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ zIndex: 9999 }}
          />
        </div>
      </div>
    </div>
  )
}
