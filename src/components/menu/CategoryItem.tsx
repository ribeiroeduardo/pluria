
import React from 'react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Accordion } from "@/components/ui/accordion";
import { SubcategoryAccordion } from './SubcategoryAccordion';
import type { Category } from '@/utils/menuUtils';
import type { Option } from '@/types/guitar';

interface CategoryItemProps {
  category: Category;
  userSelections: Record<number, number>;
  expandedCategories: string[];
  setExpandedCategories: (value: string[]) => void;
  onOptionSelect: (option: Option) => void;
  getSubcategoryIdForOption: (optionId: number) => number | undefined;
}

export const CategoryItem = ({
  category,
  userSelections,
  expandedCategories,
  setExpandedCategories,
  onOptionSelect,
  getSubcategoryIdForOption,
}: CategoryItemProps) => {
  return (
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
              onOptionSelect={onOptionSelect}
              getSubcategoryIdForOption={getSubcategoryIdForOption}
            />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};
