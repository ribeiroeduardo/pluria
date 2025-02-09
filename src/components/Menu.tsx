
import React from "react";
import { Accordion } from "@/components/ui/accordion";
import type { Option } from '@/types/guitar';
import { getSubcategoryIdForOption } from '@/utils/menuUtils';
import { MenuHeader } from './menu/MenuHeader';
import { CategoryAccordion } from './menu/CategoryAccordion';
import { useMenuData } from '@/hooks/useMenuData';

interface MenuProps {
  onOptionSelect: (option: Option) => void;
  onInitialData: (options: Option[]) => void;
}

export function Menu({ onOptionSelect, onInitialData }: MenuProps) {
  const [userSelections, setUserSelections] = React.useState<Record<number, number>>({});
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = React.useState(false);

  const { data: categories, isLoading } = useMenuData((options: Option[]) => {
    if (!hasInitialized) {
      const defaultSelections: Record<number, number> = {};
      options.forEach(option => {
        if (option.is_default && option.id_related_subcategory) {
          defaultSelections[option.id_related_subcategory] = option.id;
        }
      });

      const sixStringsOption = options.find(opt => opt.id === 369);
      if (sixStringsOption) {
        defaultSelections[sixStringsOption.id_related_subcategory] = sixStringsOption.id;
      }

      setUserSelections(defaultSelections);
      setHasInitialized(true);
      onInitialData(options);

      Object.values(defaultSelections).forEach(optionId => {
        const option = options.find(opt => opt.id === optionId);
        if (option) {
          onOptionSelect(option);
        }
      });
    }
  });

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

  const handleOptionSelect = (option: Option) => {
    const newSelections = { ...userSelections };
    newSelections[option.id_related_subcategory] = option.id;
    setUserSelections(newSelections);
    onOptionSelect(option);
  };

  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  return (
    <div className="w-full max-w-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MenuHeader 
        isAllExpanded={isAllExpanded}
        toggleAllAccordions={toggleAllAccordions}
      />
      <Accordion 
        type="multiple" 
        value={expandedCategories}
        onValueChange={setExpandedCategories}
        className="w-full"
      >
        {categories?.map((category) => (
          <CategoryAccordion
            key={category.id}
            category={category}
            expandedCategories={expandedCategories}
            setExpandedCategories={setExpandedCategories}
            userSelections={userSelections}
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
