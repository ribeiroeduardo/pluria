import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Option } from '@/types/guitar';
import { SubcategoryAccordion } from './menu/SubcategoryAccordion';
import {
  type Category,
  handlePairedSelections,
  getSubcategoryIdForOption,
  findAnySelectedOptionByValue,
  PAIRED_OPTIONS,
} from '@/utils/menuUtils';

interface MenuProps {
  onOptionSelect: (option: Option) => void;
  onInitialData: (options: Option[]) => void;
}

export function Menu({ onOptionSelect, onInitialData }: MenuProps) {
  const [userSelections, setUserSelections] = React.useState<Record<number, number>>({});
  const [selectedOptionId, setSelectedOptionId] = React.useState<number | null>(null);
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const [linkedSelections, setLinkedSelections] = React.useState<Record<number, number>>({});
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = React.useState(false);

  // Function to toggle all accordions
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

  // Main data fetching query
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
          const defaultSelections: Record<number, number> = {};
          processedOptionsData.forEach(option => {
            if (option.is_default && option.id_related_subcategory) {
              defaultSelections[option.id_related_subcategory] = option.id;
            }
          });

          const sixStringsOption = processedOptionsData.find(opt => opt.id === 369);
          if (sixStringsOption) {
            defaultSelections[sixStringsOption.id_related_subcategory] = sixStringsOption.id;
          }

          setUserSelections(defaultSelections);
          setHasInitialized(true);
          onInitialData(processedOptionsData);

          Object.values(defaultSelections).forEach(optionId => {
            const option = processedOptionsData.find(opt => opt.id === optionId);
            if (option) {
              onOptionSelect(option);
              if (option.id === sixStringsOption?.id) {
                setSelectedOptionId(option.id);
              }
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

  // Helper function to find option by ID across all categories
  const findOptionById = React.useCallback((optionId: number) => {
    return categories?.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.options)
    ).find(opt => opt.id === optionId);
  }, [categories]);

  // Helper function to notify preview of option changes
  const notifyPreviewChanges = React.useCallback((newSelections: Record<number, number>, primaryOptionId: number) => {
    const primaryOption = findOptionById(primaryOptionId);
    if (primaryOption) {
      setSelectedOptionId(primaryOptionId);
      onOptionSelect(primaryOption);
    }

    // When hardware color is selected (Black or Chrome)
    if ([727, 728].includes(primaryOptionId)) {
      // Get all hardware options that need to be switched
      const hardwareOptionIds = [1011, 1012, 731, 999, 112, 996, 102, 997];
      const targetColor = primaryOptionId === 727 ? "Preto" : "Cromado";

      // For each hardware option ID
      hardwareOptionIds.forEach(optionId => {
        const option = findOptionById(optionId);
        if (option) {
          // If this option's color matches the target color, select it
          if (option.color_hardware === targetColor) {
            onOptionSelect(option);
          }
          // If this option's color doesn't match, find and select its pair
          else {
            const pairedId = PAIRED_OPTIONS[optionId];
            if (pairedId) {
              const pairedOption = findOptionById(pairedId);
              if (pairedOption && pairedOption.color_hardware === targetColor) {
                onOptionSelect(pairedOption);
              }
            }
          }
        }
      });
    } else {
      // For non-hardware-color selections, handle paired options normally
      const pairedOptionId = PAIRED_OPTIONS[primaryOptionId];
      if (pairedOptionId) {
        const pairedOption = findOptionById(pairedOptionId);
        if (pairedOption) {
          onOptionSelect(pairedOption);
        }
      }
    }
  }, [findOptionById, onOptionSelect]);

  // Filter options function
  const filterOptions = React.useCallback((options: Option[], currentSubcategoryId: number) => {
    const allOptions = categories?.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.options)
    ) || [];

    return options.filter(option => {
      const sixStringsSelected = findAnySelectedOptionByValue("6 Strings", allOptions, userSelections);
      const sevenStringsSelected = findAnySelectedOptionByValue("7 Strings", allOptions, userSelections);
      const standardScaleSelected = findAnySelectedOptionByValue("25,5", allOptions, userSelections);
      const multiscaleSelected = findAnySelectedOptionByValue("25,5 - 27 (Multiscale)", allOptions, userSelections);

      const blackHardwareSelected = Object.values(userSelections).includes(727);
      const chromeHardwareSelected = Object.values(userSelections).includes(728);

      if (sixStringsSelected && option.strings === "7") return false;
      if (sevenStringsSelected && option.strings === "6") return false;

      if (standardScaleSelected && option.scale_length === "multiscale") return false;
      if (multiscaleSelected && option.scale_length === "standard") return false;

      if (blackHardwareSelected && option.color_hardware === "Cromado") return false;
      if (chromeHardwareSelected && option.color_hardware === "Preto") return false;

      return true;
    });
  }, [categories, userSelections]);

  // Filter categories data before rendering
  const filteredCategories = React.useMemo(() => {
    if (!categories) return null;
    
    return categories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        options: filterOptions(subcategory.options, subcategory.id),
      })),
    }));
  }, [categories, filterOptions]);

  // Loading state handler
  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  // Handle option selection
  const handleOptionSelect = (option: Option) => {
    let newSelections = { ...userSelections };

    if (option.id === 25) {
      newSelections = {
        ...newSelections,
        [option.id_related_subcategory]: option.id,
        [categories?.flatMap(cat => 
          cat.subcategories.flatMap(sub => 
            sub.options.find(opt => opt.id === 992)
          )
        ).find(Boolean)?.id_related_subcategory || 0]: 992
      };
      setLinkedSelections(prev => ({ ...prev, 25: 992 }));
    } else {
      newSelections[option.id_related_subcategory] = option.id;
    }

    newSelections = handlePairedSelections(newSelections, categories || []);
    setUserSelections(newSelections);
    
    // First notify about the primary option change
    notifyPreviewChanges(newSelections, option.id);
    
    // Then check if there's a hardware color selected and apply its changes
    const selectedHardwareColor = Object.values(newSelections).find(id => id === 727 || id === 728);
    if (selectedHardwareColor) {
      notifyPreviewChanges(newSelections, selectedHardwareColor);
    }
  };

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
        {filteredCategories?.map((category) => (
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
                  <SubcategoryAccordion
                    key={subcategory.id}
                    subcategory={subcategory}
                    userSelections={userSelections}
                    onOptionSelect={handleOptionSelect}
                    getSubcategoryIdForOption={(optionId) => 
                      getSubcategoryIdForOption(optionId, categories || [])
                    }
                  />
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
