import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Option } from '@/types/guitar';
import { OptionGroup } from './menu/OptionGroup';
import { useGuitarStore } from '@/store/useGuitarStore';
import {
  type Category,
  getSubcategoryIdForOption,
  HARDWARE_COLOR,
  STRINGS,
  getHardwareComponentIds,
  type HardwareColor,
  isHardwareColor,
  isKnobOption,
} from '@/utils/menuUtils';
import { menuRules } from '@/utils/ruleProcessor';
import { getAutoselectedOptions } from '@/utils/ruleProcessor';

interface MenuProps {
  onOptionSelect: (option: Option) => void;
  onInitialData: (options: Option[]) => void;
}

export function Menu({ onOptionSelect, onInitialData }: MenuProps) {
  const {
    categories,
    setCategories,
    userSelections,
    setSelection,
    hasInitialized,
    setHasInitialized,
    expandedCategories,
    toggleCategory,
  } = useGuitarStore();

  // Effect to handle autoselected options
  useEffect(() => {
    if (!categories || !hasInitialized) return;

    const autoselectedOptionIds = getAutoselectedOptions(userSelections);
    
    if (autoselectedOptionIds.length > 0) {
      // Find the options in our categories data
      autoselectedOptionIds.forEach(optionId => {
        // Skip if this option is already selected in any subcategory
        const isAlreadySelected = Object.values(userSelections).some(
          selection => selection.optionId === optionId
        );
        if (isAlreadySelected) return;

        const option = categories.flatMap(cat => 
          cat.subcategories.flatMap(sub => sub.options)
        ).find(opt => opt.id === optionId);

        if (option) {
          // Get the subcategory ID for this option
          const subcategory = categories.flatMap(cat => cat.subcategories)
            .find(sub => sub.options.some(opt => opt.id === optionId));

          if (subcategory) {
            setSelection(subcategory.id, optionId);
            onOptionSelect(option);
          }
        }
      });
    }
  }, [userSelections, categories, hasInitialized]);

  const { isLoading } = useQuery({
    queryKey: ["menu-data"],
    queryFn: async () => {
      try {
        const [categoriesResult, subcategoriesResult] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("subcategories")
            .select("*")
            .not('id', 'in', '(5,34,35)')
            .or('id.eq.39,id.eq.40,id.eq.41,id.eq.44,id.eq.46,hidden.is.null,hidden.eq.false')
            .order("sort_order")
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (subcategoriesResult.error) throw subcategoriesResult.error;

        const { data: optionsData, error: optionsError } = await supabase
          .from("options")
          .select("*")
          .or('id_related_subcategory.eq.39,id_related_subcategory.eq.40,id_related_subcategory.eq.41,id_related_subcategory.eq.44,id_related_subcategory.eq.46,active.eq.true,id.eq.1030,id.eq.1031')
          .order('zindex');

        if (optionsError) throw optionsError;

        const processedOptionsData = optionsData.map(option => ({
          ...option,
          image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
        }));

        const processedCategories = categoriesResult.data
          .filter((category) => category.category !== "Other")
          .map((category) => {
            const categorySubcategories = subcategoriesResult.data
              .filter((sub) => sub.id_related_category === category.id);
            
            return {
              ...category,
              subcategories: categorySubcategories.map((subcategory) => ({
                ...subcategory,
                options: processedOptionsData
                  .filter((opt) => opt.id_related_subcategory === subcategory.id)
                  .sort((a, b) => {
                    const priceA = a.price_usd || 0;
                    const priceB = b.price_usd || 0;
                    return priceA - priceB || a.zindex - b.zindex;
                  }),
              })),
            };
          });

        // Set categories in store
        setCategories(processedCategories);

        if (!hasInitialized) {
          // Set default selections from menuRules
          const defaultSelections: Record<number, number> = {};
          const baseTimestamp = Date.now();
          
          // Find subcategory IDs for each default option
          for (const [_, optionId] of Object.entries(menuRules.defaults)) {
            const option = processedOptionsData.find(opt => opt.id === optionId);
            if (option?.id_related_subcategory) {
              defaultSelections[option.id_related_subcategory] = optionId;
              // Apply selections with incrementing timestamps to maintain order
              setSelection(option.id_related_subcategory, optionId);
            }
          }

          // Only call onInitialData after all default selections are set
          onInitialData(processedOptionsData);
          setHasInitialized(true);
        }

        return processedCategories;
      } catch (error) {
        console.error('Error in queryFn:', error);
        throw error;
      }
    }
  });

  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  return (
    <div className="w-full">
      <Accordion 
        type="multiple" 
        value={expandedCategories}
        className="w-full"
      >
        {categories?.map((category) => (
          <AccordionItem 
            key={category.id} 
            value={`category-${category.id}`}
            className="border-b border-border/10"
          >
            <AccordionTrigger 
              onClick={() => toggleCategory(`category-${category.id}`)}
              className="text-sm font-medium hover:no-underline hover:bg-muted/50 transition-colors px-4 py-4"
            >
              {category.category}
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="multiple" value={expandedCategories}>
                {category.subcategories.map((subcategory) => (
                  <AccordionItem
                    key={subcategory.id}
                    value={`subcategory-${subcategory.id}`}
                    className="border-t border-border/10 first:border-t-0"
                  >
                    <AccordionTrigger
                      onClick={() => toggleCategory(`subcategory-${subcategory.id}`)}
                      className="text-xs font-medium hover:no-underline hover:bg-muted/50 transition-colors px-6 py-3"
                    >
                      {subcategory.subcategory}
                    </AccordionTrigger>
                    <AccordionContent>
                      <OptionGroup
                        subcategoryId={subcategory.id}
                        options={subcategory.options}
                        label={subcategory.subcategory}
                        onOptionSelect={onOptionSelect}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
