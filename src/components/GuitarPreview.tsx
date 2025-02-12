import type { Tables } from '@/integrations/supabase/types'
import { getImagePath } from "@/lib/imageMapping";
import React from "react";
import type { Option } from '@/types/guitar';
import { Total } from './Total';
import { useGuitarStore } from '@/store/useGuitarStore';

export const GuitarPreview = () => {
  const { userSelections, categories } = useGuitarStore();
  const [imageLayers, setImageLayers] = React.useState<Map<string, Option>>(new Map());

  // Update image layers when selections change
  React.useEffect(() => {
    console.group('Guitar Preview - Image Layer Analysis');
    const selectedOptions = Object.values(userSelections).map(sel => {
      // Find the option in categories
      for (const category of categories) {
        for (const subcategory of category.subcategories) {
          const option = subcategory.options.find(opt => opt.id === sel.optionId);
          if (option) return option;
        }
      }
      return null;
    }).filter((opt): opt is Option => opt !== null);

    console.log('Current Selections:', selectedOptions.map(opt => ({
      id: opt.id,
      name: opt.option,
      hasImage: !!opt.image_url,
      imageUrl: opt.image_url
    })));
    
    const newLayers = new Map<string, Option>();
    
    // Add selected options
    selectedOptions.forEach(option => {
      if (!option) return;
      
      if (option.image_url) {
        const imagePath = getImagePath(option.image_url);
        if (imagePath) {
          newLayers.set(imagePath, option);
          console.log('✅ Added layer for option:', {
            id: option.id,
            name: option.option,
            imageUrl: option.image_url,
            mappedPath: imagePath
          });
        } else {
          // If not in mapping, use direct URL
          newLayers.set(option.image_url, option);
          console.log('⚠️ Using direct URL for option:', {
            id: option.id,
            name: option.option,
            imageUrl: option.image_url
          });
        }
      } else {
        console.warn('❌ No image_url for option:', {
          id: option.id,
          name: option.option
        });
      }
    });

    console.log('Final Image Layers:', Array.from(newLayers.entries()).map(([path, option]) => ({
      id: option.id,
      name: option.option,
      path,
      zIndex: option.zindex || 1
    })));
    console.groupEnd();
    
    setImageLayers(newLayers);
  }, [userSelections, categories]);

  return (
    <div className="flex-1 bg-background h-full relative overflow-hidden flex flex-col items-center justify-center">
      <Total />
      <div className="relative w-[600px] h-[800px] select-none">
        {/* Base guitar image - should always be visible */}
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          {imageLayers.size === 0 && (
            <p className="text-sm">Select options to customize your guitar</p>
          )}
        </div>
        
        {/* Render all image layers */}
        {Array.from(imageLayers.entries()).map(([imagePath, option]) => {
          console.log('Rendering layer:', {
            path: imagePath,
            option: option.option,
            id: option.id,
            zIndex: option.zindex || 1
          });
          return (
            <img
              key={imagePath}
              src={imagePath}
              alt={option.option}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200"
              style={{ 
                zIndex: option.zindex || 1
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
