// Core imports
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

// Type definitions for data structures
interface Category {
  id: number;
  category: string;
  sort_order: number;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: number;
  subcategory: string;
  sort_order: number;
  options: Option[];
  hidden: boolean;
  id_related_category: number;
}

interface Option {
  id: number;
  option: string;
  price_usd: number | null;
  active: boolean;
  is_default: boolean;
  id_related_subcategory: number;
  strings: string;
  scale_length?: string;
  zindex: number;
  image_url: string | null;
  color_hardware: string | null;
  view: string | null;
}

export function Menu({ 
  onOptionSelect,
  onInitialData
}: { 
  onOptionSelect: (option: Option) => void;
  onInitialData: (options: Option[]) => void;
}) {
  // State management
  const [userSelections, setUserSelections] = React.useState<Record<number, number>>({});
  const [selectedOptionId, setSelectedOptionId] = React.useState<number | null>(null);
  const [selectedScaleLength, setSelectedScaleLength] = React.useState<string | null>(null);
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
            .eq('hidden', false)
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
          const defaultStringOption = processedOptionsData.find(opt => opt.is_default && opt.strings);
          if (defaultStringOption?.id) {
            setSelectedOptionId(defaultStringOption.id);
          }

          const defaultSelections: Record<number, number> = {};
          processedOptionsData.forEach(option => {
            if (option.is_default && option.id_related_subcategory) {
              if (option.id === 25) {
                defaultSelections[option.id_related_subcategory] = 992;
                setLinkedSelections(prev => ({ ...prev, 25: 992 }));
              } else {
                defaultSelections[option.id_related_subcategory] = option.id;
              }
            }
          });

          setUserSelections(defaultSelections);
          setHasInitialized(true);
          onInitialData(processedOptionsData);
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

  // Effect to trigger 6 Strings selection on load
  React.useEffect(() => {
    if (categories && !hasInitialized) {
      const stringsSubcategory = categories
        .flatMap(cat => cat.subcategories)
        .find(sub => sub.options.some(opt => opt.id === 369));

      if (stringsSubcategory) {
        const sixStringsOption = stringsSubcategory.options.find(opt => opt.id === 369);
        if (sixStringsOption) {
          setUserSelections(prev => ({
            ...prev,
            [stringsSubcategory.id]: sixStringsOption.id
          }));
          setSelectedOptionId(sixStringsOption.id);
          onOptionSelect(sixStringsOption);
        }
      }
    }
  }, [categories, hasInitialized, onOptionSelect]);

  // Client-side filtering function
  const filterOptions = React.useCallback((options: Option[]) => {
    return options.filter(option => {
      // String filtering
      if (selectedOptionId) {
        const selectedOption = options.find(opt => opt.id === selectedOptionId);
        if (selectedOption?.option === "6 Strings" && option.strings === "7") return false;
        if (selectedOption?.option === "7 Strings" && option.strings === "6") return false;
      }

      // Scale length filtering
      if (selectedScaleLength) {
        if (option.scale_length === 'all') return true;
        if (selectedScaleLength === 'standard' && option.scale_length === 'multiscale') return false;
        if (selectedScaleLength === 'multiscale' && option.scale_length === 'standard') return false;
      }

      return true;
    });
  }, [selectedOptionId, selectedScaleLength]);

  // Filter categories data before rendering
  const filteredCategories = React.useMemo(() => {
    if (!categories) return null;
    
    return categories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        options: filterOptions(subcategory.options),
      })),
    }));
  }, [categories, filterOptions]);

  // Loading state handler
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
                {category.subcategories.map((currentSubcategory) => (
                  <AccordionItem
                    key={currentSubcategory.id}
                    value={`subcategory-${currentSubcategory.id}`}
                    className="border-0"
                  >
                    <AccordionTrigger className="text-sm pl-2 hover:no-underline hover:bg-muted/50 transition-colors">
                      {currentSubcategory.subcategory}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <RadioGroup
                        value={userSelections[currentSubcategory.id]?.toString()}
                        onValueChange={(value) => {
                          const option = currentSubcategory.options.find(
                            (opt) => opt.id.toString() === value
                          );
                          if (option) {
                            // Handle special linked selections
                            if (option.id === 25) {
                              setUserSelections(prev => ({
                                ...prev,
                                [currentSubcategory.id]: option.id,
                                [currentSubcategory.options.find(opt => opt.id === 992)?.id_related_subcategory || 0]: 992
                              }));
                              setLinkedSelections(prev => ({ ...prev, 25: 992 }));
                            } else {
                              setUserSelections(prev => ({
                                ...prev,
                                [currentSubcategory.id]: option.id
                              }));
                            }
                            setSelectedOptionId(option.id);
                            
                            // Update scale length selection if applicable
                            if (option.scale_length && option.scale_length !== 'all') {
                              setSelectedScaleLength(option.scale_length);
                            }
                            
                            onOptionSelect(option);
                          }
                        }}
                        className="flex flex-col gap-1.5 pl-4"
                      >
                        {currentSubcategory.options.map((option) => (
                          <div 
                            key={option.id}
                            className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem
                              value={option.id.toString()}
                              id={`option-${option.id}`}
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