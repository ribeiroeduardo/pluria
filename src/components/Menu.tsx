
import React from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Option } from '@/types/guitar';
import { CategoryItem } from './menu/CategoryItem';
import { useMenuLogic } from '@/hooks/useMenuLogic';
import { getSubcategoryIdForOption } from '@/utils/menuUtils';

interface MenuProps {
  onOptionSelect: (option: Option) => void;
  onInitialData: (options: Option[]) => void;
}

export function Menu({ onOptionSelect, onInitialData }: MenuProps) {
  const {
    categories,
    isLoading,
    userSelections,
    expandedCategories,
    isAllExpanded,
    filterOptions,
    handleOptionSelect,
    setExpandedCategories,
    toggleAllAccordions,
  } = useMenuLogic(onOptionSelect, onInitialData);

  // Filter categories data before rendering
  const filteredCategories = React.useMemo(() => {
    if (!categories) return null;
    
    return categories.map(category => ({
      ...category,
      subcategories: category.subcategories
        .filter(subcategory => {
          // Always show subcategory 39 when Buckeye Burl is selected
          if (subcategory.id === 39) {
            return Object.values(userSelections).includes(55);
          }
          return true;
        })
        .map(subcategory => ({
          ...subcategory,
          options: filterOptions(subcategory.options, subcategory.id),
        })),
    }));
  }, [categories, filterOptions, userSelections]);

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
          <CategoryItem
            key={category.id}
            category={category}
            userSelections={userSelections}
            expandedCategories={expandedCategories}
            setExpandedCategories={setExpandedCategories}
            onOptionSelect={handleOptionSelect}
            getSubcategoryIdForOption={(optionId) => 
              getSubcategoryIdForOption(optionId, categories || [])
            }
          />
        ))}
      </Accordion>
    </div>
  );
}
