import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SubcategoryItem } from "./SubcategoryItem";
import type { Category } from "./types";

interface CategoryItemProps {
  category: Category;
  userSelections: Record<number, number>;
  onOptionSelect: (option: Option) => void;
}

export function CategoryItem({ category, userSelections, onOptionSelect }: CategoryItemProps) {
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
        <Accordion type="single" collapsible className="w-full">
          {category.subcategories.map((subcategory) => (
            <SubcategoryItem
              key={subcategory.id}
              subcategory={subcategory}
              userSelections={userSelections}
              onOptionSelect={onOptionSelect}
            />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}