import type { Tables } from '@/integrations/supabase/types'
import { getImagePath } from "@/lib/imageMapping";

interface GuitarPreviewProps {
  selections: Record<string, Option>;
  total: number;
}

export const GuitarPreview = ({ selections, total }: GuitarPreviewProps) => {
  return (
    <div className="flex-1 bg-background h-full relative overflow-hidden">
      <div className="absolute top-4 right-4 text-sm z-[9999]">
        Total: ${total}
      </div>
      <div className="h-full flex items-center justify-center p-8 overflow-hidden">
        <div className="relative w-full h-full max-w-2xl max-h-2xl select-none">
          {selections && Object.entries(selections).map(([_, option]) => {
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
        </div>
      </div>
    </div>
  );
};