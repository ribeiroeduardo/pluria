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
  strings?: string | null;
}

export function Menu({ 
  onOptionSelect,
  onInitialData
}: { 
  onOptionSelect: (option: Option) => void;
  onInitialData: (options: Option[]) => void;
}) {
  const [userSelections, setUserSelections] = React.useState<Record<number, number>>({});
  const [selectedStringCount, setSelectedStringCount] = React.useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = React.useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", selectedStringCount],
    queryFn: async () => {
      console.log("Fetching menu data with string count:", selectedStringCount);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      if (categoriesError) {
        throw categoriesError;
      }

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from("subcategories")
        .select("*")
        .not('id', 'in', '(5,34,35)')
        .order("sort_order");

      if (subcategoriesError) {
        throw subcategoriesError;
      }

      // Fetch options with string filtering
      let optionsQuery = supabase
        .from("options")
        .select("*")
        .eq("active", true);

      // Apply string filtering based on selected string count
      if (selectedStringCount) {
        optionsQuery = optionsQuery.or(`strings.eq.${selectedStringCount},strings.eq.all,strings.is.null`);
      }

      const { data: optionsData, error: optionsError } = await optionsQuery
        .order('zindex', { ascending: true });

      if (optionsError) {
        throw optionsError;
      }

      // Initialize with default selections on first load
      if (!hasInitialized) {
        const defaultSelections: Record<number, number> = {};
        optionsData.forEach(option => {
          if (option.is_default && option.id_related_subcategory) {
            defaultSelections[option.id_related_subcategory] = option.id;
            
            // Set initial string count if this is a string option
            if (option.option === "6 Strings") {
              setSelectedStringCount("6");
            } else if (option.option === "7 Strings") {
              setSelectedStringCount("7");
            }
          }
        });
        setUserSelections(defaultSelections);
        setHasInitialized(true);
        onInitialData(optionsData);
      }

      // Build the nested structure
      const categoriesWithChildren = categoriesData
        .filter((category) => category.category !== "Other")
        .map((category) => ({
          ...category,
          subcategories: subcategoriesData
            .filter((sub) => sub.id_related_category === category.id)
            .map((subcategory) => ({
              ...subcategory,
              options: optionsData
                .filter((opt) => opt.id_related_subcategory === subcategory.id)
                .sort((a, b) => {
                  const priceA = a.price_usd || 0;
                  const priceB = b.price_usd || 0;
                  return priceA - priceB;
                }),
            })),
        }));

      return categoriesWithChildren;
    },
  });

  const handleOptionSelect = (subcategoryId: number, option: Option) => {
    // Update string count if this is a string option
    if (option.option === "6 Strings") {
      setSelectedStringCount("6");
    } else if (option.option === "7 Strings") {
      setSelectedStringCount("7");
    }

    // Update user selections
    setUserSelections(prev => ({
      ...prev,
      [subcategoryId]: option.id
    }));

    onOptionSelect(option);
  };

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
            className="border-b border-border/10"
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
                    className="border-0"
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
                            handleOptionSelect(subcategory.id, option);
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