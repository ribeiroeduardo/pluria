import type { Tables } from '@/integrations/supabase/types'
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getImagePath } from "@/lib/imageMapping";
import React from "react";

// Add helper function to get hardware images
const getHardwareImages = (option: Option) => {
  if (option?.subcategory === "Hardware Color") {
    if (option.id === 727) { // Black
      return [
        'omni-tarraxas-6-preto.png',
        'omni-ponte-fixa-6-preto.png',
        'omni-knob-volume-preto.png',
        'omni-knob-tone-preto.png'
      ];
    }
    if (option.id === 728) { // Chrome
      return [
        'omni-tarraxas-6-cromado.png',
        'omni-ponte-fixa-6-cromado.png',
        'omni-knob-volume-cromado.png',
        'omni-knob-tone-cromado.png'
      ];
    }
  }
  return null;
};

interface GuitarPreviewProps {
  selections: Record<string, Option>;
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
  // Fetch lighting options
  const { data: lightingImages } = useQuery({
    queryKey: ["lighting-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("options")
        .select("*")
        .in("id", [994, 995]);

      if (error) throw error;
      
      return data?.map(option => ({
        ...option,
        image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
      }));
    }
  });

  // Create a map of all unique image layers
  const [imageLayers, setImageLayers] = React.useState<Map<string, Option>>(new Map());

  // Update image layers when selections change
  React.useEffect(() => {
    const newLayers = new Map<string, Option>();
    
    // Add lighting images first
    lightingImages?.forEach(option => {
      if (option.image_url) {
        newLayers.set(option.image_url, option);
      }
    });

    // Add selected options
    Object.values(selections).forEach(option => {
      if (!option) return;

      // Handle hardware images
      const hardwareImages = getHardwareImages(option);
      if (hardwareImages) {
        hardwareImages.forEach((image, index) => {
          newLayers.set(`/images/${image}`, {
            ...option,
            image_url: `/images/${image}`,
            zindex: option.zindex || 1
          });
        });
        return;
      }

      // Handle regular images
      if (option.image_url) {
        newLayers.set(option.image_url, option);
      }
    });

    setImageLayers(newLayers);
  }, [selections, lightingImages]);

  return (
    <div className="flex-1 bg-background h-full relative overflow-hidden">
      <div className="absolute top-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg w-64 text-xs z-[9999]">
        <h3 className="font-medium mb-2 pb-2 border-b border-white/20">Selected Options</h3>
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
        <div className="mt-4 pt-2 border-t border-white/20">
          <div className="flex justify-between items-center">
            <span>Total</span>
            <span className="font-medium">
              ${total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="h-full flex items-center justify-center p-8 overflow-hidden">
        <div className="relative w-full h-full max-w-2xl max-h-2xl select-none">
          {/* Render all image layers */}
          {Array.from(imageLayers.values()).map((option) => {
            const imagePath = getImagePath(option.image_url);
            return imagePath && (
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
    </div>
  );
};