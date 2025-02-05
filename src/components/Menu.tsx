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
  const [userSelections, setUserSelections] = React.useState<Record<number, number>>({});
  const [selectedOptionId, setSelectedOptionId] = React.useState<number | null>(null);
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const [linkedSelections, setLinkedSelections] = React.useState<Record<number, number>>({});
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = React.useState(false);

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
              if (option.id === 25) {
                defaultSelections[option.id_related_subcategory] = 992;
                setLinkedSelections(prev => ({ ...prev, 25: 992 }));
              } else {
                defaultSelections[option.id_related_subcategory] = option.id;
              }
            }
          });

          const sixStringsOption = processedOptionsData.find(opt => opt.id === 369);
          if (sixStringsOption) {
            defaultSelections[sixStringsOption.id_related_subcategory] = sixStringsOption.id;
          }

          const selectionsWithPairs = Object.entries(defaultSelections).reduce((acc, [subcategoryId, optionId]) => {
            acc[subcategoryId] = optionId;
            const pairedOptionId = PAIRED_OPTIONS[optionId];
            if (pairedOptionId) {
              const pairedOption = processedOptionsData.find(opt => opt.id === pairedOptionId);
              if (pairedOption) {
                acc[pairedOption.id_related_subcategory] = pairedOptionId;
              }
            }
            return acc;
          }, {} as Record<number, number>);

          setUserSelections(selectionsWithPairs);
          setHasInitialized(true);
          onInitialData(processedOptionsData);

          Object.values(selectionsWithPairs).forEach(optionId => {
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

  const getSubcategoryIdForOption = React.useCallback((optionId: number) => {
    const allOptions = categories?.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.options)
    ) || [];
    return allOptions.find(opt => opt.id === optionId)?.id_related_subcategory;
  }, [categories]);

  const handlePairedSelections = React.useCallback((currentSelections: Record<number, number>) => {
    let newSelections = { ...currentSelections };
    
    const hardwareColorSubcategoryId = 25;
    const selectedHardwareColorId = newSelections[hardwareColorSubcategoryId];
    const selectedHardwareColor = findOptionById(selectedHardwareColorId);
    
    Object.entries(currentSelections).forEach(([subcategoryId, optionId]) => {
      const pairedOptionId = PAIRED_OPTIONS[optionId];
      if (pairedOptionId) {
        const pairedSubcategoryId = getSubcategoryIdForOption(pairedOptionId);
        if (pairedSubcategoryId) {
          const pairedOption = findOptionById(pairedOptionId);
          const isBlackHardware = selectedHardwareColorId === 727;
          const isValidPair = isBlackHardware 
            ? pairedOption?.color_hardware === "Preto"
            : pairedOption?.color_hardware === "Cromado";
          
          if (isValidPair) {
            newSelections[pairedSubcategoryId] = pairedOptionId;
          }
        }
      }
    });

    return newSelections;
  }, [findOptionById, getSubcategoryIdForOption]);

  const findSelectedOptionBySubcategory = React.useCallback((subcategoryId: number, options: Option[]) => {
    const selectedId = userSelections[subcategoryId];
    return options.find(opt => opt.id === selectedId);
  }, [userSelections]);

  const findAnySelectedOptionByValue = React.useCallback((optionValue: string, allOptions: Option[]) => {
    const selectedIds = Object.values(userSelections);
    return allOptions.find(opt => selectedIds.includes(opt.id) && opt.option === optionValue);
  }, [userSelections]);

  const filterOptions = React.useCallback((options: Option[], currentSubcategoryId: number) => {
    const allOptions = categories?.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.options)
    ) || [];

    return options.filter(option => {
      const sixStringsSelected = findAnySelectedOptionByValue("6 Strings", allOptions);
      const sevenStringsSelected = findAnySelectedOptionByValue("7 Strings", allOptions);
      const standardScaleSelected = findAnySelectedOptionByValue("25,5", allOptions);
      const multiscaleSelected = findAnySelectedOptionByValue("25,5 - 27 (Multiscale)", allOptions);

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
  }, [categories, userSelections, findAnySelectedOptionByValue]);

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

  const notifyPreviewChanges = React.useCallback((newSelections: Record<number, number>, primaryOptionId: number) => {
    const primaryOption = findOptionById(primaryOptionId);
    if (primaryOption) {
      setSelectedOptionId(primaryOptionId);
      onOptionSelect(primaryOption);
    }

    const pairedOptionId = PAIRED_OPTIONS[primaryOptionId];
    if (pairedOptionId) {
      const pairedOption = findOptionById(pairedOptionId);
      if (pairedOption) {
        if ([1011, 1012, 731, 999, 112, 996].includes(primaryOptionId)) {
          onOptionSelect(primaryOption);
        } else {
          onOptionSelect(pairedOption);
        }
      }
    }

    if ([727, 728].includes(primaryOptionId)) {
      Object.values(newSelections).forEach(optionId => {
        if ([1011, 1012, 731, 999, 112, 996].includes(optionId)) {
          const option = findOptionById(optionId);
          if (option) {
            const pairedId = PAIRED_OPTIONS[optionId];
            if (pairedId) {
              const pairedOption = findOptionById(pairedId);
              if (pairedOption) {
                onOptionSelect(pairedOption);
              }
            }
          }
        }
      });
    }
  }, [findOptionById, onOptionSelect]);

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
                            let newSelections = { ...userSelections };

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

                            newSelections = handlePairedSelections(newSelections);

                            setUserSelections(newSelections);
                            
                            notifyPreviewChanges(newSelections, option.id);
                          }
                        }}
                        className="flex flex-col gap-1.5 pl-4"
                      >
                        {currentSubcategory.options.map((option) => {
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
