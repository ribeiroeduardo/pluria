
import React from 'react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { Option } from '@/types/guitar';
import type { Subcategory } from '@/utils/menuUtils';
import { OptionRadioGroup } from './OptionRadioGroup';

interface SubcategoryAccordionProps {
  subcategory: Subcategory;
  userSelections: Record<number, number>;
  onOptionSelect: (option: Option) => void;
  getSubcategoryIdForOption: (optionId: number) => number | undefined;
}

export const SubcategoryAccordion = ({
  subcategory,
  userSelections,
  onOptionSelect,
  getSubcategoryIdForOption,
}: SubcategoryAccordionProps) => {
  return (
    <AccordionItem
      key={subcategory.id}
      value={`subcategory-${subcategory.id}`}
      className="border-0"
    >
      <AccordionTrigger className="text-sm pl-2 hover:no-underline hover:bg-muted/50 transition-colors">
        {subcategory.subcategory}
      </AccordionTrigger>
      <AccordionContent className="pt-1 pb-3">
        <OptionRadioGroup
          subcategory={subcategory}
          userSelections={userSelections}
          onOptionSelect={onOptionSelect}
          getSubcategoryIdForOption={getSubcategoryIdForOption}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
