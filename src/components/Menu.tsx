import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import { SubcategoryMenu } from "./SubcategoryMenu";
import { applyFilters, getDefaultSelections } from "@/utils/menuFilters";
import type { Category, Option } from "@/types/menu";

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

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", selectedOptionId],
    queryFn: async () => {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      if (categoriesError) throw categoriesError;

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from("subcategories")
        .select("*")
        .not('id', 'in', '(5,34,35)')
        .order("sort_order");

      if (subcategoriesError) throw subcategoriesError;

      // Fetch and filter options
      let optionsQuery = supabase
        .from("options")
        .select("*")
        .eq("active", true);

      // Apply filters based on selected option
      optionsQuery = applyFilters(optionsQuery, selectedOptionId);
      
      // Execute query and order results
      const { data: optionsData, error: optionsError } = await optionsQuery
        .order('zindex', { ascending: true });

      if (optionsError) throw optionsError;

      const processedOptionsData = optionsData.map(option => ({
        ...option,
        image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
      }));

      // Initialize default selections
      if (!hasInitialized) {
        const defaultStringOption = processedOptionsData.find(opt => opt.is_default && opt.strings);
        if (defaultStringOption?.id) {
          setSelectedOptionId(defaultStringOption.id);
        }
        
        const defaultSelections = getDefaultSelections(processedOptionsData);
        setUserSelections(defaultSelections);
        setHasInitialized(true);
        onInitialData(processedOptionsData);
      }

      // Build the nested structure
      return categoriesData
        .filter((category) => category.category !== "Other")
        .map((category) => ({
          ...category,
          subcategories: subcategoriesData
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
    },
  });

  const handleOptionSelect = (subcategoryId: number, optionId: number) => {
    const option = categories
      ?.flatMap(cat => cat.subcategories)
      .find(sub => sub.id === subcategoryId)
      ?.options.find(opt => opt.id === optionId);

    if (option) {
      if (option.id === 25) {
        setUserSelections(prev => ({
          ...prev,
          [subcategoryId]: option.id,
          [992]: 992
        }));
        setLinkedSelections(prev => ({ ...prev, 25: 992 }));
      } else {
        setUserSelections(prev => ({
          ...prev,
          [subcategoryId]: option.id
        }));
      }
      setSelectedOptionId(option.id);
      onOptionSelect(option);
    }
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
                  <SubcategoryMenu
                    key={subcategory.id}
                    subcategory={subcategory}
                    selectedValue={userSelections[subcategory.id]}
                    onOptionSelect={(optionId) => handleOptionSelect(subcategory.id, optionId)}
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