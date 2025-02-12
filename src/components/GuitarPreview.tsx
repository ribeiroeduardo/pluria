import type { Tables } from '@/integrations/supabase/types'
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getImagePath } from "@/lib/imageMapping";
import React from "react";
import type { Option } from '@/types/guitar';

interface GuitarPreviewProps {
  selections: Record<number, Option>;
  total: number;
}

interface ProductPreviewProps {
  selectedOptions: Option[];
}

function ProductPreview({ selectedOptions }: ProductPreviewProps) {
  return (
    <div>
      {selectedOptions.map(option => (
        <div key={option.id}>
          {option.image_url && <img src={option.image_url} alt={option.option} />}
        </div>
      ))}
    </div>
  );
}

export const GuitarPreview = ({ selections, total }: GuitarPreviewProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Fetch lighting options
  const { data: lightingImages } = useQuery({
    queryKey: ["lighting-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("options")
        .select("*")
        .in("id", [994, 995]);

      if (error) throw error;
      
      console.log('Fetched lighting options:', data);
      
      return data?.map(option => ({
        ...option,
        image_url: option.image_url || null
      }));
    }
  });

  // Create a map of all unique image layers
  const [imageLayers, setImageLayers] = React.useState<Map<string, Option>>(new Map());

  // Update image layers when selections change
  React.useEffect(() => {
    console.log('Selections received in GuitarPreview:', selections);
    console.log('Lighting images received:', lightingImages);
    
    const newLayers = new Map<string, Option>();
    
    // Add lighting images first
    lightingImages?.forEach(option => {
      if (option.image_url) {
        const imagePath = getImagePath(option.image_url);
        console.log('Processing lighting image:', {
          id: option.id,
          option: option.option,
          originalUrl: option.image_url,
          mappedPath: imagePath
        });
        if (imagePath) {
          newLayers.set(imagePath, option);
        }
      }
    });

    // Add selected options
    Object.values(selections).forEach(option => {
      if (!option) return;
      
      // Handle regular images
      if (option.image_url) {
        const imagePath = getImagePath(option.image_url);
        console.log('Processing selected option:', {
          id: option.id,
          option: option.option,
          originalUrl: option.image_url,
          mappedPath: imagePath
        });
        if (imagePath) {
          newLayers.set(imagePath, option);
        }
      }
    });

    const finalLayers = Array.from(newLayers.entries());
    console.log('Final image layers:', finalLayers.map(([path, option]) => ({
      path,
      option: option.option,
      id: option.id,
      zIndex: option.id === 992 || option.id === 1002 ? 999 : (option.zindex || 1)
    })));
    
    setImageLayers(newLayers);
  }, [selections, lightingImages]);

  return (
    <div className="flex-1 bg-background h-full relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg w-64 text-xs z-[9999]">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-medium">Total</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              ${total.toLocaleString('en-US', {
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
              {Object.values(selections).map((option) => (
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
      <div className="relative w-[600px] h-[800px] select-none">
        {/* Render all image layers */}
        {Array.from(imageLayers.entries()).map(([imagePath, option]) => {
          console.log('Rendering layer:', {
            path: imagePath,
            option: option.option,
            id: option.id,
            zIndex: option.id === 992 || option.id === 1002 ? 999 : (option.zindex || 1)
          });
          return (
            <img
              key={imagePath}
              src={imagePath}
              alt={option.option}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ 
                zIndex: option.id === 992 || option.id === 1002 ? 999 : (option.zindex || 1)
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
