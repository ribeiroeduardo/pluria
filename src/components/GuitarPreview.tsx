import React, { useMemo } from 'react';
import { useGuitarStore } from '@/store/useGuitarStore';
import { Option } from '@/types/guitar';
import { cn } from '@/lib/utils';

interface GuitarPreviewProps {
  className?: string;
}

const getImageUrl = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('/')) return url;
  if (url.startsWith('http')) return url;
  return `/images/${url}`;
};

// Lighting images that should always be displayed on top
const LIGHTING_IMAGES = [
  'omni-lighting-sombra-corpo.png',
  'omni-lighting-luz-corpo.png'
];

export const GuitarPreview: React.FC<GuitarPreviewProps> = ({ className }) => {
  const { userSelections, categories, hasInitialized } = useGuitarStore();

  const selectedOptions = useMemo(() => {
    const options: Option[] = [];
    
    // Flatten categories and find selected options
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        const selection = userSelections[subcategory.id];
        if (selection) {
          const option = subcategory.options.find(opt => opt.id === selection.optionId);
          if (option && option.image_url && option.zindex !== undefined) {
            options.push(option);
          }
        }
      });
    });

    // Sort by zindex
    return options.sort((a, b) => (a.zindex || 0) - (b.zindex || 0));
  }, [categories, userSelections]);

  return (
    <div className={cn('relative flex items-center justify-center bg-background w-full h-full py-8', className)}>
      <div className="relative w-full h-full max-h-[calc(100%-4rem)]">
        {!hasInitialized ? (
          <div className="text-gray-500 p-4 text-center">Loading...</div>
        ) : selectedOptions.length === 0 ? (
          <div className="text-red-500 p-4 text-center">No options selected</div>
        ) : (
          <>
            {/* Render regular options */}
            {selectedOptions.map((option) => {
              const imageUrl = getImageUrl(option.image_url);
              return (
                <img
                  key={option.id}
                  src={imageUrl}
                  alt={option.option}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ zIndex: option.zindex || 0 }}
                  onError={(e) => console.error('Image failed to load:', imageUrl)}
                  onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                />
              );
            })}

            {/* Render lighting effects on top */}
            {LIGHTING_IMAGES.map((imageName, index) => (
              <img
                key={imageName}
                src={getImageUrl(imageName)}
                alt={`Lighting effect ${index + 1}`}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ zIndex: 1000 }}
                onError={(e) => console.error('Lighting image failed to load:', imageName)}
                onLoad={() => console.log('Lighting image loaded successfully:', imageName)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}; 