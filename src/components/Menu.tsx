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
}

interface Option {
  id: number;
  option: string;
  price_usd: number | null;
  active: boolean;
  is_default: boolean;
}

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

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", selectedOptionId],
    queryFn: async () => {
      console.log("Fetching categories...");
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw categoriesError;
      }

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from("subcategories")
        .select("*")
        .order("sort_order");

      if (subcategoriesError) {
        console.error("Error fetching subcategories:", subcategoriesError);
        throw subcategoriesError;
      }

      // Fetch options
      let optionsQuery = supabase
        .from("options")
        .select()
        .eq('active', true)
        .not('id_related_subcategory', 'in', '(34,35)'); // Always hide Bare Knuckle options by default

      // Apply scale length filtering based on selected option
      if (userSelections[242]) {
        optionsQuery = optionsQuery.not('scale_length', 'eq', 'Multiscale');
      } else if (userSelections[243]) {
        optionsQuery = optionsQuery.eq('scale_length', 'Multiscale');
      }

      // Apply string filtering based on selected option
      if (selectedOptionId === 369) {
        optionsQuery = optionsQuery.or('strings.eq.6,strings.eq.all');
      } else if (selectedOptionId === 370) {
        optionsQuery = optionsQuery.or('strings.eq.7,strings.eq.all');
      } else if (selectedOptionId === 371) {
        optionsQuery = optionsQuery.or('strings.eq.8,strings.eq.all');
      }

      // Execute query and order by price first, then zindex
      const { data: optionsData, error: optionsError } = await optionsQuery
        .order('price_usd', { ascending: true, nullsFirst: true })
        .then(({ data, error }) => {
          if (error) throw error;
          // Update image URLs to use local paths
          return {
            data: data?.map(option => ({
              ...option,
              image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
            })),
            error: null
          };
        });

      if (optionsError) {
        console.error("Error fetching options:", optionsError);
        throw optionsError;
      }
      
      // Update strings configuration when an option with strings is selected
      if (!hasInitialized) {
        const defaultStringOption = optionsData?.find(opt => opt.is_default && opt.strings);
        if (defaultStringOption?.id) {
          setSelectedOptionId(defaultStringOption.id);
        }
        
        // Initialize with default selections only on first load
        const defaultSelections: Record<number, number> = {};
        optionsData.forEach(option => {
          if (option.is_default && option.id_related_subcategory) {
            defaultSelections[option.id_related_subcategory] = option.id;
          }
        });
        setUserSelections(defaultSelections);
        setHasInitialized(true);
        onInitialData(optionsData);
      }

      // Build the nested structure
      const categoriesWithChildren = categoriesData
        .filter((category) => category.category !== "Other") // Filter out "Other" category
        .map((category) => ({
          ...category,
          subcategories: subcategoriesData
            .filter((sub) => 
              sub.id_related_category === category.id && 
              ![34, 35].includes(sub.id)
            )
            .map((subcategory) => ({
              ...subcategory,
              options: optionsData
                .filter((opt) => opt.id_related_subcategory === subcategory.id)
                .sort((a, b) => {
                  // First sort by price
                  const priceA = a.price_usd || 0;
                  const priceB = b.price_usd || 0;
                  if (priceA !== priceB) {
                    return priceA - priceB;
                  }
                  // If prices are equal, maintain z-index order
                  return a.zindex - b.zindex;
                }),
            })),
        }));

      console.log("Fetched data:", categoriesWithChildren);
      return categoriesWithChildren;
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  return (
    <div className="w-full max-w-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Accordion type="single" collapsible className="w-full">
        {categories?.map((category) => (
          <AccordionItem 
            key={category.id} 
            value={`category-${category.id}`}
            className="border-b border-border/10 text-left"
          >
            <AccordionTrigger className="text-sm font-medium hover:no-underline hover:bg-muted/50 transition-colors">
              {category.category}
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" collapsible className="w-full">
                {category.subcategories.map((subcategory) => (
                  <AccordionItem
                    key={subcategory.id}
                    value={`subcategory-${subcategory.id}`}
                    className="border-0 text-left"
                  >
                    <AccordionTrigger className="text-sm pl-2 hover:no-underline hover:bg-muted/50 transition-colors">
                      {subcategory.subcategory}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <RadioGroup
                       value={userSelections[subcategory.id]?.toString()}
                        onValueChange={(value) => {
                          const option = subcategory.options.find(
                            (opt) => opt.id.toString() === value
                          );
                          if (option) {
                            // Update user selections
                            setUserSelections(prev => ({
                              ...prev,
                              [option.id]: true,
                              [subcategory.id]: option.id
                            }));
                            setSelectedOptionId(option.id);
                            onOptionSelect(option);
                          }
                        }}
                        className="flex flex-col gap-1.5 pl-4"
                      >
                        {subcategory.options.map((option) => (
                          <div 
                            key={option.id}
                           className="flex items-center space-x-2 rounded-sm px-2 py-1 hover:bg-muted/50 transition-colors text-left"
                          >
                            <RadioGroupItem
                              value={option.id.toString()}
                              id={`option-${option.id}`}
                            />
                           <Label htmlFor={`option-${option.id}`} className="flex-1 text-xs cursor-pointer text-left">
                              {option.option}
                              <span className="ml-2 text-xs text-muted-foreground">
                                (+${(option.price_usd || 0).toLocaleString('en-US', {
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