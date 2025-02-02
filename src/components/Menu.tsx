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
  // State management for user selections and menu behavior
  const [userSelections, setUserSelections] = React.useState<Record<number, number>>({});
  const [selectedOptionId, setSelectedOptionId] = React.useState<number | null>(null);
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const [linkedSelections, setLinkedSelections] = React.useState<Record<number, number>>({});

  // Main data fetching query
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", selectedOptionId], 
    queryFn: async () => {
      try {
        // Fetch and validate categories data
        const [categoriesResult, subcategoriesResult] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("subcategories")
            .select("*")
            .not('id', 'in', '(5,34,35)') // Exclude specific subcategories
            .eq('hidden', false)
            .order("sort_order")
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (subcategoriesResult.error) throw subcategoriesResult.error;

        // Build options query with filters
        let optionsQuery = supabase
          .from("options")
          .select("*")
          .eq("active", true);

        // Apply string count filters based on selection
        if (selectedOptionId === 369) {
          // For 6-string guitars: show options with 6 strings, universal options (all), or options with no string count
          optionsQuery = optionsQuery.or('strings.eq.6,strings.eq.all,strings.is.null');
        } else if (selectedOptionId === 370) {
          // For 7-string guitars: show options with 7 strings, universal options (all), or options with no string count
          optionsQuery = optionsQuery.or('strings.eq.7,strings.eq.all,strings.is.null');
        } else if (selectedOptionId === 371) {
          // For 8-string guitars: show options with 8 strings, universal options (all), or options with no string count
          optionsQuery = optionsQuery.or('strings.eq.8,strings.eq.all,strings.is.null');
        } 

        // Execute options query with ordering
        const { data: optionsData, error: optionsError } = await optionsQuery.order('zindex');
        if (optionsError) throw optionsError;

        // Process image URLs for options
        const processedOptionsData = optionsData.map(option => ({
          ...option,
          image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
        }));

        // Handle initial data setup and default selections
        if (!hasInitialized) {
          const defaultStringOption = processedOptionsData.find(opt => opt.is_default && opt.strings);
          if (defaultStringOption?.id) {
            setSelectedOptionId(defaultStringOption.id);
          }

          // Set up default selections including special cases
          const defaultSelections: Record<number, number> = {};
          processedOptionsData.forEach(option => {
            if (option.is_default && option.id_related_subcategory) {
              if (option.id === 25) { // Special case for linked selection
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

        // Build final nested data structure
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

  // Loading state handler
  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  // Render menu structure
  return (
    <div className="w-full max-w-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Accordion type="single" collapsible className="w-full">
        {/* Render categories */}
        {categories?.map((category) => (
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
              <Accordion type="single" collapsible className="w-full">
                {category.subcategories.map((subcategory) => (
                  <AccordionItem
                    key={subcategory.id}
                    value={`subcategory-${subcategory.id}`}
                    className="border-0"
                  >
                    {/* Subcategory header */}
                    <AccordionTrigger className="text-sm pl-2 hover:no-underline hover:bg-muted/50 transition-colors">
                      {subcategory.subcategory}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      {/* Options radio group */}
                      <RadioGroup
                        value={userSelections[subcategory.id]?.toString()}
                        onValueChange={(value) => {
                          const option = subcategory.options.find(
                            (opt) => opt.id.toString() === value
                          );
                          if (option) {
                            // Handle special linked selections
                            if (option.id === 25) {
                              setUserSelections(prev => ({
                                ...prev,
                                [subcategory.id]: option.id,
                                [subcategory.options.find(opt => opt.id === 992)?.id_related_subcategory || 0]: 992
                              }));
                              setLinkedSelections(prev => ({ ...prev, 25: 992 }));
                            } else {
                              setUserSelections(prev => ({
                                ...prev,
                                [subcategory.id]: option.id
                              }));
                            }
                            setSelectedOptionId(option.id);
                            onOptionSelect(option);
                          }
                        }}
                        className="flex flex-col gap-1.5 pl-4"
                      >
                        {/* Individual option items */}
                        {subcategory.options.map((option) => (
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
                              {/* Price display with formatting */}
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
