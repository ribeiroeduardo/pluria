import React from 'react';
import { useGuitarStore } from '@/store/useGuitarStore';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface GuitarMenuProps {
  className?: string;
}

export const GuitarMenu: React.FC<GuitarMenuProps> = ({ className }) => {
  const { categories, userSelections, setSelection } = useGuitarStore();

  return (
    <div className={cn('space-y-4', className)}>
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={String(category.id)}>
            <AccordionTrigger className="text-lg font-semibold">
              {category.category}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-4">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      {subcategory.subcategory}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {subcategory.options.map((option) => {
                        const isSelected = userSelections[subcategory.id]?.optionId === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => setSelection(subcategory.id, option.id)}
                            className={cn(
                              'flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
                              'hover:bg-gray-100',
                              isSelected ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700'
                            )}
                          >
                            <span>{option.option}</span>
                            {option.price_usd && (
                              <span className="text-gray-500">
                                ${option.price_usd.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}; 