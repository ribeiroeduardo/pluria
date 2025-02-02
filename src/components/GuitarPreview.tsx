import type { Tables } from '@/integrations/supabase/types'
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getImagePath } from "@/lib/imageMapping";

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

  return (
    <div className="flex-1 bg-background h-full relative overflow-hidden">
      <div className="absolute top-4 right-4 text-sm z-[9999]">
        Total: ${total.toFixed(2)}
      </div>
      <div className="h-full flex items-center justify-center p-8 overflow-hidden">
        <div className="relative w-full h-full max-w-2xl max-h-2xl select-none">
          {/* Render lighting images first */}
          {lightingImages?.map(option => {
            const imagePath = getImagePath(option?.image_url);
            return imagePath && (
              <img
                key={option.id}
                src={imagePath}
                alt={option.option}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: option.zindex }}
              />
            );
          })}

          {selections && Object.entries(selections).map(([_, option]) => {
            // Special handling for options 992 and 1002
            const shouldShow = option?.id !== 992 && option?.id !== 1002;
            const imagePath = getImagePath(option?.image_url);
            const hardwareImages = getHardwareImages(option);

            if (!shouldShow) return null;

            if (hardwareImages) {
              return hardwareImages.map((image, index) => (
                <img
                  key={`${option.id}-${index}`}
                  src={`/images/${image}`}
                  alt={`${option.option} hardware ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ zIndex: option.zindex || 1 }}
                />
              ));
            }

            return imagePath && (
              <img
                key={option.id}
                src={imagePath}
                alt={option.option}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: option.zindex || 1 }}
              />
            );
          })}
          {/* Render options 992 and 1002 separately to ensure they're always on top */}
          {Object.values(selections).map(option => {
            if (option?.id !== 992 && option?.id !== 1002) return null;
            const imagePath = getImagePath(option?.image_url);
            return imagePath && (
              <img
                key={option.id}
                src={imagePath}
                alt={option.option}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 999 }} // Ensure these are always on top
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};