import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryItem } from "./menu/CategoryItem";
import { useState } from "react";
import type { Category, Option } from "./menu/types";

interface MenuProps {
  onOptionSelect: (option: Option) => void;
  onInitialData: (options: Option[]) => void;
}

export function Menu({ onOptionSelect, onInitialData }: MenuProps) {
  const [userSelections, setUserSelections] = useState<Record<number, number>>({});
  const [selectedStringOption, setSelectedStringOption] = useState<string>("6");
  const [selectedScaleLength, setSelectedScaleLength] = useState<string>("standard");
  const [hasInitialized, setHasInitialized] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", selectedStringOption, selectedScaleLength],
    queryFn: async () => {
      console.log("Fetching menu data with filters:", { selectedStringOption, selectedScaleLength });
      
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
      const { data: optionsData, error: optionsError } = await supabase
        .from("options")
        .select("*")
        .eq("active", true)
        .or(`strings.eq.${selectedStringOption},strings.eq.all,strings.is.null`)
        .or(`scale_length.eq.${selectedScaleLength},scale_length.eq.all,scale_length.is.null`)
        .order('price_usd', { ascending: true });

      if (optionsError) throw optionsError;

      // Process options data
      const processedOptionsData = optionsData.map(option => ({
        ...option,
        image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
      }));

      // Initialize default selections
      if (!hasInitialized) {
        const defaultSelections: Record<number, number> = {};
        processedOptionsData.forEach(option => {
          if (option.is_default && option.id_related_subcategory) {
            defaultSelections[option.id_related_subcategory] = option.id;
            
            // Update string and scale length states based on defaults
            if (option.strings) {
              setSelectedStringOption(option.strings);
            }
            if (option.scale_length) {
              setSelectedScaleLength(option.scale_length);
            }
          }
        });
        setUserSelections(defaultSelections);
        setHasInitialized(true);
        onInitialData(processedOptionsData);
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
              options: processedOptionsData
                .filter((opt) => opt.id_related_subcategory === subcategory.id)
                .sort((a, b) => (a.price_usd || 0) - (b.price_usd || 0))
            }))
            .filter(sub => sub.options.length > 0) // Filter out subcategories with no active options
        }));

      return categoriesWithChildren;
    },
  });

  const handleOptionSelect = (option: Option) => {
    // Update selections
    setUserSelections(prev => ({
      ...prev,
      [option.id_related_subcategory]: option.id
    }));

    // Update filters based on selection
    if (option.strings) {
      setSelectedStringOption(option.strings);
    }
    if (option.scale_length) {
      setSelectedScaleLength(option.scale_length);
    }

    onOptionSelect(option);
  };

  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  return (
    <div className="w-full max-w-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full">
        {categories?.map((category: Category) => (
          <CategoryItem
            key={category.id}
            category={category}
            userSelections={userSelections}
            onOptionSelect={handleOptionSelect}
          />
        ))}
      </div>
    </div>
  );
}