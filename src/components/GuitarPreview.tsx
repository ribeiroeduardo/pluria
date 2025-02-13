import React from 'react'
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { cn } from '@/lib/utils'

interface GuitarPreviewProps {
  className?: string
}

export const GuitarPreview = ({ className }: GuitarPreviewProps) => {
  const { configuration, imageLayers } = useGuitarConfig()
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div className={cn("flex-1 bg-background h-full relative overflow-hidden", className)}>
      {/* Price Summary */}
      <div className="absolute top-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg w-64 text-xs z-[9999]">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-medium">Total</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              ${configuration.totalPrice.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {isExpanded && (
          <>
            <div className="mt-4 pt-2 border-t border-white/20" />
            <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40">
              {Array.from(configuration.selectedOptions.values()).map((option) => (
                <div key={option.id} className="space-y-0.5">
                  <div className="font-medium">{option.option}</div>
                  {option.price_usd !== null && (
                    <div className="text-white/50">
                      +${option.price_usd.toLocaleString('en-US', {
                        minimumFractionDigits: option.price_usd >= 1000 ? 2 : 0,
                        maximumFractionDigits: option.price_usd >= 1000 ? 2 : 0
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

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
        </div>
      </div>
    </div>
  )
}
