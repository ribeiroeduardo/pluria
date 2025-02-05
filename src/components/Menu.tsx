import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Category, Subcategory, Option } from "@/types/menu";

export function Menu({ 
  onOptionSelect,
  onInitialData
}: { 
  onOptionSelect: (option: Option) => void;
  onInitialData: (options: Option[]) => void;
}) {
  // Query for fetching categories and options
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const [categoriesResult, subcategoriesResult] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("subcategories")
            .select("*")
            .not('id', 'in', '(5,34,35)')
            .or('hidden.is.null,hidden.eq.false')
            .order("sort_order")
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (subcategoriesResult.error) throw subcategoriesResult.error;

        const { data: optionsData, error: optionsError } = await supabase
          .from("options")
          .select("*")
          .eq("active", true)
          .order('zindex');

        if (optionsError) throw optionsError;

        const processedOptionsData = optionsData.map(option => ({
          ...option,
          image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
        }));

        if (!hasInitialized) {
          const defaultSelections = new Set<number>();
          processedOptionsData.forEach(option => {
            if (option.is_default) {
              if (option.id === 25) {
                defaultSelections.add(992);
              } else {
                defaultSelections.add(option.id);
              }
            }
          });

          const sixStringsOption = processedOptionsData.find(opt => opt.id === 369);
          if (sixStringsOption) {
            defaultSelections.add(sixStringsOption.id);
          }

          setSelectedOptions(defaultSelections);
          setHasInitialized(true);
          onInitialData(processedOptionsData);

          Array.from(defaultSelections).forEach(optionId => {
            const option = processedOptionsData.find(opt => opt.id === optionId);
            if (option) {
              onOptionSelect(option);
            }
          });
        }

        return categoriesResult.data
          .filter((category) => category.category !== "Other")
          .map((category) => ({
            ...category,
            subcategories: subcategoriesResult.data
              .filter((sub) => sub.id_related_category === category.id)
              .map((subcategory) => ({
                ...subcategory,
                options: processedOptionsData
                  .filter((opt) => opt.id_related_subcategory === subcategory.id)
                  .sort((a, b) => {
                    const priceA = a.price_usd || 0;
                    const priceB = b.price_usd || 0;
                    return priceA - priceB || a.zindex - b.zindex;
                  }),
              })),
          }));
      } catch (error) {
        console.error('Error in queryFn:', error);
        throw error;
      }
    },
  });

  const [selectedOptions, setSelectedOptions] = React.useState<Set<number>>(new Set());
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = React.useState(false);

  const PAIRED_OPTIONS = {
    1011: 1012,
    1012: 1011,
    731: 999,
    999: 731,
    112: 996,
    996: 112,
  };

  const toggleAllAccordions = () => {
    if (isAllExpanded) {
      setExpandedCategories([]);
    } else {
      const allCategoryValues = categories?.map(category => `category-${category.id}`) || [];
      const allSubcategoryValues = categories?.flatMap(category => 
        category.subcategories.map(sub => `subcategory-${sub.id}`)
      ) || [];
      setExpandedCategories([...allCategoryValues, ...allSubcategoryValues]);
    }
    setIsAllExpanded(!isAllExpanded);
  };

  const findOptionById = React.useCallback((optionId: number) => {
    return categories?.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.options)
    ).find(opt => opt.id === optionId);
  }, [categories]);

  const handleOptionSelect = (option: Option) => {
    setSelectedOptions(prev => {
      const newSelections = new Set(prev);
      
      // If selecting hardware color
      if (option.id === 727 || option.id === 728) {
        // Remove other hardware color options
        newSelections.delete(727);
        newSelections.delete(728);
        
        // Add the new selection
        newSelections.add(option.id);
        
        // Update paired options based on hardware color
        Array.from(newSelections).forEach(id => {
          const pairedId = PAIRED_OPTIONS[id];
          if (pairedId) {
            const pairedOption = findOptionById(pairedId);
            if (pairedOption) {
              const isBlackHardware = option.id === 727;
              const isValidPair = isBlackHardware 
                ? pairedOption.color_hardware === "Preto"
                : pairedOption.color_hardware === "Cromado";
              
              if (isValidPair) {
                newSelections.add(pairedId);
              }
            }
          }
        });
      } else {
        // For non-hardware color options
        const pairedId = PAIRED_OPTIONS[option.id];
        if (pairedId) {
          const currentHardwareColor = Array.from(prev).find(id => id === 727 || id === 728);
          const pairedOption = findOptionById(pairedId);
          
          if (pairedOption && currentHardwareColor) {
            const isBlackHardware = currentHardwareColor === 727;
            const isValidPair = isBlackHardware 
              ? pairedOption.color_hardware === "Preto"
              : pairedOption.color_hardware === "Cromado";
            
            if (isValidPair) {
              newSelections.add(pairedId);
            }
          }
        }
        
        newSelections.add(option.id);
      }
      
      return newSelections;
    });

    onOptionSelect(option);
  };

  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  return (
    <div className="w-full max-w-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-end mb-2 px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAllAccordions}
          className="text-xs"
        >
          {isAllExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Expand All
            </>
          )}
        </Button>
      </div>
      <Accordion 
        type="multiple" 
        value={expandedCategories}
        onValueChange={setExpandedCategories}
        className="w-full"
      >
        {categories?.map((category) => (
          <AccordionItem 
            key={category.id} 
            value={`category-${category.id}`}
            className="border-b border-border/10"
          >
            <AccordionTrigger className="text-sm font-medium hover:no-underline hover:bg-muted/50 transition-colors">
              {category.category}
            </AccordionTrigger>
            <AccordionContent>
              <Accordion 
                type="multiple"
                value={expandedCategories}
                onValueChange={setExpandedCategories}
                className="w-full"
              >
                {category.subcategories.map((subcategory) => (
                  <AccordionItem
                    key={subcategory.id}
                    value={`subcategory-${subcategory.id}`}
                    className="border-0"
                  >
                    <AccordionTrigger className="text-sm pl-2 hover:no-underline hover:bg-muted/50 transition-colors">
                      {subcategory.subcategory}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <RadioGroup
                        value={Array.from(selectedOptions)
                          .find(id => subcategory.options.some(opt => opt.id === id))?.toString()}
                        onValueChange={(value) => {
                          const option = subcategory.options.find(
                            (opt) => opt.id.toString() === value
                          );
                          if (option) {
                            handleOptionSelect(option);
                          }
                        }}
                        className="flex flex-col gap-1.5 pl-4"
                      >
                        {subcategory.options.map((option) => (
                          <div 
                            key={option.id}
                            className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem
                              value={option.id.toString()}
                              id={`option-${option.id}`}
                              checked={selectedOptions.has(option.id)}
                            />
                            <Label htmlFor={`option-${option.id}`} className="flex-1 text-sm cursor-pointer">
                              {option.option}
                              <span className="ml-2 text-xs text-muted-foreground">
                                (+${option.price_usd?.toLocaleString('en-US', {
                                  minimumFractionDigits: option.price_usd >= 1000 ? 2 : 0,
                                  maximumFractionDigits: option.price_usd >= 1000 ? 2 : 0
                                }) || '0'})
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
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