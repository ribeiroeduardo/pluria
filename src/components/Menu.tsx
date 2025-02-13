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
  HARDWARE_COLOR,
  STRINGS,
  getHardwareComponentIds,
  type HardwareColor,
  isHardwareColor,
  isKnobOption,
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
  const [isBuckeyeBurlSelected, setIsBuckeyeBurlSelected] = React.useState(false);
  const [isFlamedMapleSelected, setIsFlamedMapleSelected] = React.useState(false);
  const [isMapleBurlSelected, setIsMapleBurlSelected] = React.useState(false);
  const [isQuiltedMapleSelected, setIsQuiltedMapleSelected] = React.useState(false);
  const [isPaulowniaSelected, setIsPaulowniaSelected] = React.useState(false);

  // Main data fetching query
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const [categoriesResult, subcategoriesResult] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("subcategories")
            .select("*")
            .not('id', 'in', '(5,34,35)')  // Exclude subcategory 5 (Spokewheel) from menu
            .or('id.eq.39,id.eq.40,id.eq.41,id.eq.44,id.eq.46,hidden.is.null,hidden.eq.false')  // Include all special subcategories
            .order("sort_order")
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (subcategoriesResult.error) throw subcategoriesResult.error;

        console.log('Fetched subcategories:', subcategoriesResult.data);

        const { data: optionsData, error: optionsError } = await supabase
          .from("options")
          .select("*")
          .or('id_related_subcategory.eq.39,id_related_subcategory.eq.40,id_related_subcategory.eq.41,id_related_subcategory.eq.44,id_related_subcategory.eq.46,active.eq.true,id.eq.1030,id.eq.1031')  // Include Spokewheel options in data but not menu
          .order('zindex');

        if (optionsError) throw optionsError;

        console.log('Fetched options:', optionsData); // Debug log

        const processedOptionsData = optionsData.map(option => ({
          ...option,
          image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
        }));

        // Debug log to check subcategory 39 options
        const subcategory39Options = processedOptionsData.filter(opt => opt.id_related_subcategory === 39);
        console.log('Subcategory 39 options:', subcategory39Options);

        if (!hasInitialized) {
          const defaultSelections: Record<number, number> = {};
          processedOptionsData.forEach(option => {
            if (option.is_default && option.id_related_subcategory) {
              defaultSelections[option.id_related_subcategory] = option.id;
              
              // If Paulownia is a default selection
              if (option.id === 91) {
                setIsPaulowniaSelected(true);
                setIsBuckeyeBurlSelected(false);
                setIsFlamedMapleSelected(false);
                setIsMapleBurlSelected(false);
                setIsQuiltedMapleSelected(false);
                
                // Auto-select Natural (id 1032)
                const naturalOption = processedOptionsData.find(opt => opt.id === 1032);
                if (naturalOption) {
                  defaultSelections[naturalOption.id_related_subcategory] = naturalOption.id;
                }

                // Expand the category containing subcategory 46
                const categoryId = categoriesResult.data.find(cat => 
                  subcategoriesResult.data.some(sub => 
                    sub.id === 46 && sub.id_related_category === cat.id
                  )
                )?.id;

                if (categoryId) {
                  setExpandedCategories([`category-${categoryId}`]);
                }
              }
            }
          });

          const sixStringsOption = processedOptionsData.find(opt => opt.id === 369);
          if (sixStringsOption) {
            defaultSelections[sixStringsOption.id_related_subcategory] = sixStringsOption.id;
          }

          // Add black Spokewheel as default
          const spokewheelOption = processedOptionsData.find(opt => opt.id === 1030);
          if (spokewheelOption) {
            defaultSelections[spokewheelOption.id_related_subcategory] = spokewheelOption.id;
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
          .map((category) => {
            const categorySubcategories = subcategoriesResult.data
              .filter((sub) => sub.id_related_category === category.id);
            
            console.log(`Category ${category.id} subcategories:`, categorySubcategories);
            
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

  // Helper function to get current string count
  const getCurrentStringCount = React.useCallback((): '6' | '7' | null => {
    const allOptions = categories?.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.options)
    ) || [];
    
    if (findAnySelectedOptionByValue("6 Strings", allOptions, userSelections)) return '6';
    if (findAnySelectedOptionByValue("7 Strings", allOptions, userSelections)) return '7';
    return null;
  }, [categories, userSelections]);

  // Helper function to notify preview of option changes
  const notifyPreviewChanges = React.useCallback((newSelections: Record<number, number>, primaryOptionId: number) => {
    console.log('notifyPreviewChanges called with:', { newSelections, primaryOptionId });
    
    const primaryOption = findOptionById(primaryOptionId);
    if (primaryOption) {
      setSelectedOptionId(primaryOptionId);
      onOptionSelect(primaryOption);

      // If the option has an image, make sure it's passed to the preview
      if (primaryOption.image_url) {
        console.log('Sending primary option to preview:', primaryOption);
        onOptionSelect({
          ...primaryOption,
          image_url: primaryOption.image_url
        });
      }
    }

    // When hardware color is selected (Black or Chrome)
    if (isHardwareColor(primaryOptionId)) {
      console.log('Hardware color selected:', primaryOptionId);
      const stringCount = getCurrentStringCount();
      if (!stringCount) return;

      const componentIds = getHardwareComponentIds(primaryOptionId, stringCount, newSelections);
      console.log('Hardware components to be added:', componentIds);

      // For each hardware component
      componentIds.forEach(componentId => {
        const option = findOptionById(componentId);
        if (option) {
          console.log('Processing hardware component:', option);
          onOptionSelect(option);
          // If the hardware component has an image, make sure it's passed to the preview
          if (option.image_url) {
            console.log('Sending hardware component to preview:', option);
            onOptionSelect({
              ...option,
              image_url: option.image_url
            });
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
          // If the paired option has an image, make sure it's passed to the preview
          if (pairedOption.image_url) {
            console.log('Sending paired option to preview:', pairedOption);
            onOptionSelect({
              ...pairedOption,
              image_url: pairedOption.image_url
            });
          }
        }
      }
    }
  }, [findOptionById, onOptionSelect, getCurrentStringCount]);

  // Filter options function
  const filterOptions = React.useCallback((options: Option[], currentSubcategoryId: number) => {
    const allOptions = categories?.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.options)
    ) || [];

    // Show options for subcategory 39 when Buckeye Burl is selected
    if (currentSubcategoryId === 39) {
      console.log('Checking subcategory 39 visibility:', { 
        isBuckeyeBurlSelected, 
        userSelections,
        availableOptions: options
      });
      
      if (!isBuckeyeBurlSelected) {
        return [];
      }
      return options;
    }

    // Show options for subcategory 40 when Flamed Maple is selected
    if (currentSubcategoryId === 40) {
      console.log('Checking subcategory 40 visibility:', { 
        isFlamedMapleSelected, 
        userSelections,
        availableOptions: options
      });
      
      if (!isFlamedMapleSelected) {
        return [];
      }
      return options;
    }

    // Show options for subcategory 41 when Maple Burl is selected
    if (currentSubcategoryId === 41) {
      console.log('Checking subcategory 41 visibility:', { 
        isMapleBurlSelected, 
        userSelections,
        availableOptions: options
      });
      
      if (!isMapleBurlSelected) {
        return [];
      }
      return options;
    }

    // Show options for subcategory 44 when Quilted Maple is selected
    if (currentSubcategoryId === 44) {
      console.log('Checking subcategory 44 visibility:', { 
        isQuiltedMapleSelected, 
        userSelections,
        availableOptions: options
      });
      
      if (!isQuiltedMapleSelected) return [];
      return options;
    }

    return options.filter(option => {
      const sixStringsSelected = findAnySelectedOptionByValue("6 Strings", allOptions, userSelections);
      const sevenStringsSelected = findAnySelectedOptionByValue("7 Strings", allOptions, userSelections);
      const standardScaleSelected = findAnySelectedOptionByValue("25,5", allOptions, userSelections);
      const multiscaleSelected = findAnySelectedOptionByValue("25,5 - 27 (Multiscale)", allOptions, userSelections);

      const blackHardwareSelected = Object.values(userSelections).includes(HARDWARE_COLOR.BLACK);
      const chromeHardwareSelected = Object.values(userSelections).includes(HARDWARE_COLOR.CHROME);

      // String count compatibility
      if (sixStringsSelected && option.strings === "7") return false;
      if (sevenStringsSelected && option.strings === "6") return false;

      // Scale compatibility
      if (standardScaleSelected && option.scale_length === "multiscale") return false;
      if (multiscaleSelected && option.scale_length === "standard") return false;

      // Hardware color compatibility
      if (blackHardwareSelected && option.color_hardware === "Cromado") return false;
      if (chromeHardwareSelected && option.color_hardware === "Preto") return false;

      return true;
    });
  }, [categories, userSelections, isBuckeyeBurlSelected, isFlamedMapleSelected, isMapleBurlSelected, isQuiltedMapleSelected]);

  // Filter categories data before rendering
  const filteredCategories = React.useMemo(() => {
    if (!categories) return null;
    
    console.log('Debug - isPaulowniaSelected:', isPaulowniaSelected);
    console.log('Debug - All subcategories before filtering:', categories.flatMap(cat => cat.subcategories));
    
    return categories.map(category => ({
      ...category,
      subcategories: category.subcategories
        .filter(subcategory => {
          console.log(`Debug - Filtering subcategory ${subcategory.id}:`, {
            isPaulowniaSelected,
            isSubcat46: subcategory.id === 46,
            isSubcat47: subcategory.id === 47
          });

          // Show subcategory 39 when Buckeye Burl is selected
          if (subcategory.id === 39) {
            return isBuckeyeBurlSelected && !isFlamedMapleSelected && !isMapleBurlSelected && !isQuiltedMapleSelected && !isPaulowniaSelected;
          }
          // Hide subcategories 40, 41, 44 when Buckeye Burl is selected
          if ([40, 41, 44].includes(subcategory.id) && isBuckeyeBurlSelected) {
            return false;
          }
          // Show subcategory 40 when Flamed Maple is selected
          if (subcategory.id === 40) {
            return isFlamedMapleSelected && !isBuckeyeBurlSelected && !isMapleBurlSelected && !isQuiltedMapleSelected && !isPaulowniaSelected;
          }
          // Hide subcategories 39, 41, 44 when Flamed Maple is selected
          if ([39, 41, 44].includes(subcategory.id) && isFlamedMapleSelected) {
            return false;
          }
          // Show subcategory 41 when Maple Burl is selected
          if (subcategory.id === 41) {
            return isMapleBurlSelected && !isBuckeyeBurlSelected && !isFlamedMapleSelected && !isQuiltedMapleSelected && !isPaulowniaSelected;
          }
          // Hide subcategories 39, 40, 44 when Maple Burl is selected
          if ([39, 40, 44].includes(subcategory.id) && isMapleBurlSelected) {
            return false;
          }
          // Show subcategory 44 when Quilted Maple is selected
          if (subcategory.id === 44) {
            return isQuiltedMapleSelected && !isBuckeyeBurlSelected && !isFlamedMapleSelected && !isMapleBurlSelected && !isPaulowniaSelected;
          }
          // Hide subcategories 39, 40, 41 when Quilted Maple is selected
          if ([39, 40, 41].includes(subcategory.id) && isQuiltedMapleSelected) {
            return false;
          }
          // Show subcategory 46 when Paulownia is selected
          if (subcategory.id === 46) {
            return isPaulowniaSelected;
          }
          // Hide subcategory 47 when Paulownia is selected
          if (subcategory.id === 47 && isPaulowniaSelected) {
            return false;
          }
          return true;
        })
        .map(subcategory => ({
          ...subcategory,
          options: filterOptions(subcategory.options, subcategory.id)
            .filter(option => option.id !== 1030 && option.id !== 1031) // Filter out Spokewheel options from menu
        })),
    }));
  }, [categories, filterOptions, isBuckeyeBurlSelected, isFlamedMapleSelected, isMapleBurlSelected, isQuiltedMapleSelected, isPaulowniaSelected]);

  // Loading state handler
  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  // Handle option selection
  const handleOptionSelect = (option: Option) => {
    console.log('Debug - handleOptionSelect:', {
      optionId: option.id,
      isPaulownia: option.id === 91,
      currentSelections: userSelections
    });

    let newSelections = { ...userSelections };

    // If the option has an image, make sure it's passed to the preview
    if (option.image_url) {
      onOptionSelect({
        ...option,
        image_url: option.image_url
      });
    }

    // Update selection states
    if (option.id === 91) {
      console.log('Debug - Paulownia selected');
      
      // Update selections first
      newSelections[option.id_related_subcategory] = option.id;
      
      // Then update state
      setIsPaulowniaSelected(true);
      setIsBuckeyeBurlSelected(false);
      setIsFlamedMapleSelected(false);
      setIsMapleBurlSelected(false);
      setIsQuiltedMapleSelected(false);
      
      // Debug log for subcategory 46
      console.log('Debug - Subcategory 46 data:', categories?.flatMap(cat => 
        cat.subcategories.filter(sub => sub.id === 46)
      ));
      
      // Auto-select Natural (id 1032) when Paulownia is selected
      const naturalOption = categories?.flatMap(cat => 
        cat.subcategories.flatMap(sub => 
          sub.options.find(opt => opt.id === 1032)
        )
      ).find(Boolean);
      
      console.log('Debug - Natural option found:', naturalOption);
      
      if (naturalOption) {
        newSelections[naturalOption.id_related_subcategory] = naturalOption.id;
        onOptionSelect(naturalOption);
      }

      // Set user selections before state updates
      setUserSelections(newSelections);
      
      // Force re-render by updating a category
      setExpandedCategories(prev => {
        const categoryId = categories?.find(cat => 
          cat.subcategories.some(sub => sub.id === 46)
        )?.id;
        if (categoryId && !prev.includes(`category-${categoryId}`)) {
          return [...prev, `category-${categoryId}`];
        }
        return prev;
      });

    } else if (option.id === 55) {
      setIsBuckeyeBurlSelected(true);
      setIsFlamedMapleSelected(false);
      setIsMapleBurlSelected(false);
      setIsQuiltedMapleSelected(false);
      setIsPaulowniaSelected(false);
    } else if (option.id === 244) {
      setIsFlamedMapleSelected(true);
      setIsBuckeyeBurlSelected(false);
      setIsMapleBurlSelected(false);
      setIsQuiltedMapleSelected(false);
      setIsPaulowniaSelected(false);
    } else if (option.id === 53) {
      setIsMapleBurlSelected(true);
      setIsBuckeyeBurlSelected(false);
      setIsFlamedMapleSelected(false);
      setIsQuiltedMapleSelected(false);
      setIsPaulowniaSelected(false);
    } else if (option.id === 59) {
      setIsQuiltedMapleSelected(true);
      setIsBuckeyeBurlSelected(false);
      setIsFlamedMapleSelected(false);
      setIsMapleBurlSelected(false);
      setIsPaulowniaSelected(false);
    } else if (userSelections[option.id_related_subcategory] === 55) {
      setIsBuckeyeBurlSelected(false);
    } else if (userSelections[option.id_related_subcategory] === 244) {
      setIsFlamedMapleSelected(false);
    } else if (userSelections[option.id_related_subcategory] === 53) {
      setIsMapleBurlSelected(false);
    } else if (userSelections[option.id_related_subcategory] === 59) {
      setIsQuiltedMapleSelected(false);
    } else if (userSelections[option.id_related_subcategory] === 91) {
      setIsPaulowniaSelected(false);
      // Clear Natural selection if it was auto-selected
      const naturalOptionSubcategoryId = categories?.flatMap(cat => 
        cat.subcategories.flatMap(sub => 
          sub.options.find(opt => opt.id === 1032)
        )
      ).find(Boolean)?.id_related_subcategory;
      
      if (naturalOptionSubcategoryId) {
        delete newSelections[naturalOptionSubcategoryId];
      }
    }

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
    console.log('New selections:', newSelections);  // Debug log
    setUserSelections(newSelections);
    
    // First notify about the primary option change
    notifyPreviewChanges(newSelections, option.id);
    
    // Then check if there's a hardware color selected and apply its changes
    const selectedHardwareColor = Object.values(newSelections).find(id => id === HARDWARE_COLOR.BLACK || id === HARDWARE_COLOR.CHROME);
    if (selectedHardwareColor) {
      notifyPreviewChanges(newSelections, selectedHardwareColor);
    }
  };

  return (
    <div className="w-full max-w-md">
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
