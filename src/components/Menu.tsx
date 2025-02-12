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
import menuRulesJson from "@/config/menuRules.json";

export function Menu() {
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

  const handleOptionSelect = (option: Option) => {
    if (option.id_related_subcategory) {
      setSelection(option.id_related_subcategory, option.id);
    }
  };

  const { isLoading } = useQuery({
    queryKey: ["menu-data"],
    queryFn: async () => {
      try {
        const [categoriesResult, subcategoriesResult] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("subcategories")
            .select("*")
            .or('hidden.is.null,hidden.eq.false')
            .order("sort_order")
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (subcategoriesResult.error) throw subcategoriesResult.error;

        const { data: optionsData, error: optionsError } = await supabase
          .from("options")
          .select("*")
          .or('active.eq.true')
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

        setCategories(processedCategories);

        if (!hasInitialized) {
          const defaultSelections = Object.entries(menuRulesJson.defaults);
          
          for (const [category, optionId] of defaultSelections) {
            const option = processedOptionsData.find(opt => opt.id === optionId);
            
            if (option?.id_related_subcategory) {
              setSelection(option.id_related_subcategory, optionId, true);
            }
          }
          
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
                {category.subcategories.map((subcategory) => {
                  const isSelected = userSelections[subcategory.id] !== undefined;
                  return (
                    <AccordionItem
                      key={subcategory.id}
                      value={`subcategory-${subcategory.id}`}
                      className={`border-t border-border/10 first:border-t-0 ${isSelected ? 'bg-muted/20' : ''}`}
                    >
                      <AccordionTrigger
                        onClick={() => toggleCategory(`subcategory-${subcategory.id}`)}
                        className="text-xs font-medium hover:no-underline hover:bg-muted/50 transition-colors px-6 py-3"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{subcategory.subcategory}</span>
                          {isSelected && (
                            <span className="text-xs text-muted-foreground">
                              {subcategory.options.find(opt => opt.id === userSelections[subcategory.id]?.optionId)?.option}
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <OptionGroup
                          subcategoryId={subcategory.id}
                          options={subcategory.options}
                          label={subcategory.subcategory}
                          onOptionSelect={handleOptionSelect}
                          selectedOptionId={userSelections[subcategory.id]?.optionId}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
