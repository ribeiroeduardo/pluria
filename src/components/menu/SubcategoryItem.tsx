import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { OptionsList } from "./OptionsList";
import type { Subcategory, Option } from "./types";

interface SubcategoryItemProps {
  subcategory: Subcategory;
  userSelections: Record<number, number>;
  onOptionSelect: (option: Option) => void;
}

export function SubcategoryItem({ subcategory, userSelections, onOptionSelect }: SubcategoryItemProps) {
  // Only show subcategories that have active options
  if (subcategory.options.length === 0) {
    return null;
  }

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
        <OptionsList
          subcategory={subcategory}
          userSelections={userSelections}
          onOptionSelect={onOptionSelect}
        />
      </AccordionContent>
    </AccordionItem>
  );
}