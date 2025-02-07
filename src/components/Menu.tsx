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
  scale_length: string;
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
  // State management for user selections and menu behavior
  const [userSelections, setUserSelections] = React.useState<Record<number, number>>({});
  const [selectedOptionId, setSelectedOptionId] = React.useState<number | null>(null);
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const [linkedSelections, setLinkedSelections] = React.useState<Record<number, number>>({});
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = React.useState(false);

  // Define option pairs that should always be selected together
  const PAIRED_OPTIONS = {
    1012: 1011, // Volume + Tone Chrome pairs with Black
    1011: 1012, // Volume + Tone Black pairs with Chrome
    731: 999,   // Volume Knob Black pairs with Chrome
    999: 731,   // Volume Knob Chrome pairs with Black
    112: 996,   // Hipshot Fixed Bridge Black pairs with Chrome
    996: 112,   // Hipshot Fixed Bridge Chrome pairs with Black
    
  };

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
        // Fetch and validate categories data
        const [categoriesResult, subcategoriesResult] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("subcategories")
            .select("*")
            .not('id', 'in', '(5,34,35)') // Exclude specific subcategories
            .or('hidden.is.null,hidden.eq.false') // Include both null and false values
            .order("sort_order")
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (subcategoriesResult.error) throw subcategoriesResult.error;

        // Fetch all options without filtering
        const { data: optionsData, error: optionsError } = await supabase
          .from("options")
          .select("*")
          .eq("active", true)
          .order('zindex');

        if (optionsError) throw optionsError;

        // Process image URLs for options
        const processedOptionsData = optionsData.map(option => ({
          ...option,
          image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
        }));

        // Handle initial data setup and default selections
        if (!hasInitialized) {
          // Set up default selections including special cases
          const defaultSelections: Record<number, number> = {};
          processedOptionsData.forEach(option => {
            // Only set actual default options marked as is_default
            if (option.is_default && option.id_related_subcategory) {
              defaultSelections[option.id_related_subcategory] = option.id;
            }
          });

          // Find and set the 6 Strings option (id: 369)
          const sixStringsOption = processedOptionsData.find(opt => opt.id === 369);
          if (sixStringsOption) {
            defaultSelections[sixStringsOption.id_related_subcategory] = sixStringsOption.id;
          }

          // Set the selections without applying pairs
          setUserSelections(defaultSelections);
          setHasInitialized(true);
          onInitialData(processedOptionsData);

          // Notify preview about initial selections
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

        // Build final nested data structure without filtering
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

  // Helper function to get subcategory ID for an option ID
  const getSubcategoryIdForOption = React.useCallback((optionId: number) => {
    const allOptions = categories?.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.options)
    ) || [];
    return allOptions.find(opt => opt.id === optionId)?.id_related_subcategory;
  }, [categories]);

  // Helper function to handle paired selections
  const handlePairedSelections = React.useCallback((currentSelections: Record<number, number>) => {
    let newSelections = { ...currentSelections };
    
    // Check each selection for pairs
    Object.entries(currentSelections).forEach(([subcategoryId, optionId]) => {
      const pairedOptionId = PAIRED_OPTIONS[optionId];
      if (pairedOptionId) {
        // Find subcategory ID for the paired option
        const pairedSubcategoryId = getSubcategoryIdForOption(pairedOptionId);
        if (pairedSubcategoryId) {
          newSelections[pairedSubcategoryId] = pairedOptionId;
        }
      }
    });

    return newSelections;
  }, [getSubcategoryIdForOption]);

  // Helper function to find selected option by subcategory
  const findSelectedOptionBySubcategory = React.useCallback((subcategoryId: number, options: Option[]) => {
    const selectedId = userSelections[subcategoryId];
    return options.find(opt => opt.id === selectedId);
  }, [userSelections]);

  // Helper function to find any selected option by its exact value
  const findAnySelectedOptionByValue = React.useCallback((optionValue: string, allOptions: Option[]) => {
    const selectedIds = Object.values(userSelections);
    return allOptions.find(opt => selectedIds.includes(opt.id) && opt.option === optionValue);
  }, [userSelections]);

  // Client-side filtering function
  const filterOptions = React.useCallback((options: Option[], currentSubcategoryId: number) => {
    // Get all available options across all subcategories for cross-filtering
    const allOptions = categories?.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.options)
    ) || [];

    return options.filter(option => {
      // String count filtering
      const sixStringsSelected = findAnySelectedOptionByValue("6 Strings", allOptions);
      const sevenStringsSelected = findAnySelectedOptionByValue("7 Strings", allOptions);
      const standardScaleSelected = findAnySelectedOptionByValue("25,5", allOptions);
      const multiscaleSelected = findAnySelectedOptionByValue("25,5 - 27 (Multiscale)", allOptions);

      // Hardware color filtering
      const blackHardwareSelected = Object.values(userSelections).includes(727); // Black hardware
      const chromeHardwareSelected = Object.values(userSelections).includes(728); // Chrome hardware

      // Apply string count filters
      if (sixStringsSelected && option.strings === "7") return false;
      if (sevenStringsSelected && option.strings === "6") return false;

      // Apply scale length filters
      if (standardScaleSelected && option.scale_length === "multiscale") return false;
      if (multiscaleSelected && option.scale_length === "standard") return false;

      // Apply hardware color filters
      if (blackHardwareSelected && option.color_hardware === "Cromado") return false;
      if (chromeHardwareSelected && option.color_hardware === "Preto") return false;

      return true;
    });
  }, [categories, userSelections, findAnySelectedOptionByValue]);

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

  // Helper function to find option by ID across all categories
  const findOptionById = React.useCallback((optionId: number) => {
    return categories?.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.options)
    ).find(opt => opt.id === optionId);
  }, [categories]);

  // Helper function to notify preview of option changes
  const notifyPreviewChanges = React.useCallback((newSelections: Record<number, number>, primaryOptionId: number) => {
    // First notify about the primary selected option
    const primaryOption = findOptionById(primaryOptionId);
    if (primaryOption) {
      setSelectedOptionId(primaryOptionId);
      onOptionSelect(primaryOption);

      // Then check for and notify about any paired options
      const pairedOptionId = PAIRED_OPTIONS[primaryOptionId];
      if (pairedOptionId) {
        const pairedOption = findOptionById(pairedOptionId);
        if (pairedOption) {
          // Don't send paired options for hardware color changes
          if (![727, 728].includes(primaryOptionId)) {
            onOptionSelect(pairedOption);
          }
        }
      }

      // Handle hardware color-dependent options
      if ([727, 728].includes(primaryOptionId)) { // Black or Chrome hardware
        // Find all hardware-related options currently selected
        Object.values(newSelections).forEach(optionId => {
          if ([1011, 1012, 731, 999, 112, 996].includes(optionId)) {
            const option = findOptionById(optionId);
            if (option) {
              // Send the correct option based on the hardware color
              if (primaryOptionId === 727) { // Black hardware
                if (option.color_hardware === 'Cromado') {
                  const blackOption = findOptionById(PAIRED_OPTIONS[optionId]);
                  if (blackOption) {
                    onOptionSelect(blackOption);
                  }
                }
              } else { // Chrome hardware
                if (option.color_hardware === 'Preto') {
                  const chromeOption = findOptionById(PAIRED_OPTIONS[optionId]);
                  if (chromeOption) {
                    onOptionSelect(chromeOption);
                  }
                }
              }
            }
          }
        });
      }
    }
  }, [findOptionById, onOptionSelect]);

  // Loading state handler
  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  // Render menu structure
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
            {/* Category header */}
            <AccordionTrigger className="text-sm font-medium hover:no-underline hover:bg-muted/50 transition-colors">
              {category.category}
            </AccordionTrigger>
            <AccordionContent>
              {/* Nested accordion for subcategories */}
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
                    {/* Subcategory header */}
                    <AccordionTrigger className="text-sm pl-2 hover:no-underline hover:bg-muted/50 transition-colors">
                      {currentSubcategory.subcategory}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      {/* Options radio group */}
                      <RadioGroup
                        value={userSelections[currentSubcategory.id]?.toString()}
                        onValueChange={(value) => {
                          const option = currentSubcategory.options.find(
                            (opt) => opt.id.toString() === value
                          );
                          if (option) {
                            // Create a new selections object to handle multiple updates
                            let newSelections = { ...userSelections };

                            // Handle special linked selections for option id 25
                            if (option.id === 25) {
                              newSelections = {
                                ...newSelections,
                                [currentSubcategory.id]: option.id,
                                [currentSubcategory.options.find(opt => opt.id === 992)?.id_related_subcategory || 0]: 992
                              };
                              setLinkedSelections(prev => ({ ...prev, 25: 992 }));
                            } else {
                              newSelections[currentSubcategory.id] = option.id;
                            }

                            // Apply paired selections
                            newSelections = handlePairedSelections(newSelections);

                            // Update state with all selection changes
                            setUserSelections(newSelections);
                            
                            // Update preview with both the selected option and its pair
                            notifyPreviewChanges(newSelections, option.id);
                          }
                        }}
                        className="flex flex-col gap-1.5 pl-4"
                      >
                        {/* Individual option items */}
                        {currentSubcategory.options.map((option) => {
                          // Check if this option is selected directly or through pairing
                          const isSelected = userSelections[currentSubcategory.id] === option.id || 
                            Object.entries(userSelections).some(([subId, optId]) => {
                              const pairedId = PAIRED_OPTIONS[optId];
                              return pairedId === option.id && getSubcategoryIdForOption(pairedId) === currentSubcategory.id;
                            });

                          return (
                            <div 
                              key={option.id}
                              className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-muted/50 transition-colors"
                            >
                              <RadioGroupItem
                                value={option.id.toString()}
                                id={`option-${option.id}`}
                                checked={isSelected}
                              />
                              <Label htmlFor={`option-${option.id}`} className="flex-1 text-sm cursor-pointer">
                                {option.option}
                                {/* Price display with formatting */}
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (+${option.price_usd?.toLocaleString('en-US', {
                                    minimumFractionDigits: option.price_usd >= 1000 ? 2 : 0,
                                    maximumFractionDigits: option.price_usd >= 1000 ? 2 : 0
                                  }) || '0'})
                                </span>
                              </Label>
                            </div>
                          );
                        })}
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
