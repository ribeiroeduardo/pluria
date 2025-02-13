import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { OptionGroup } from './menu/OptionGroup';
import { useGuitarStore } from '@/store/useGuitarStore';

// Subcategories to hide from the menu
const HIDDEN_SUBCATEGORIES = new Set([5]); // Add any other subcategory IDs you want to hide

export function Menu() {
  const {
    categories,
    userSelections,
    expandedCategories,
    toggleCategory,
  } = useGuitarStore();

  if (!categories.length) {
    return <div className="p-4">Loading menu...</div>;
  }

  const renderSubcategories = () => {
    return categories.map((category) => {
      // Filter out hidden subcategories
      const visibleSubcategories = category.subcategories.filter(
        sub => !HIDDEN_SUBCATEGORIES.has(sub.id)
      );

      // If category has no visible subcategories, don't render it
      if (visibleSubcategories.length === 0) return null;

      return (
        <AccordionItem 
          key={category.id} 
          value={`category-${category.id}`}
          className="border-b border-border/10"
        >
          <AccordionTrigger 
            onClick={() => toggleCategory(`category-${category.id}`)}
            className="text-sm font-medium hover:no-underline hover:bg-muted/50 transition-colors px-4 py-4"
          >
            {category.category}
          </AccordionTrigger>
          <AccordionContent>
            <Accordion type="multiple" value={expandedCategories}>
              {visibleSubcategories.map((subcategory) => {
                return (
                  <AccordionItem
                    key={subcategory.id}
                    value={`subcategory-${subcategory.id}`}
                    className={`border-t border-border/10 first:border-t-0 ${userSelections[subcategory.id] ? 'bg-muted/20' : ''}`}
                  >
                    <AccordionTrigger
                      onClick={() => toggleCategory(`subcategory-${subcategory.id}`)}
                      className="text-xs font-medium hover:no-underline hover:bg-muted/50 transition-colors px-6 py-3"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{subcategory.subcategory}</span>
                        {userSelections[subcategory.id] && (
                          <span className="text-xs text-muted-foreground">
                            {subcategory.options.find(opt => opt.id === userSelections[subcategory.id]?.optionId)?.option}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <OptionGroup
                        key={subcategory.id}
                        subcategoryId={subcategory.id}
                        options={subcategory.options}
                        label={subcategory.subcategory}
                        selectedOptionId={userSelections[subcategory.id]?.optionId}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      );
    }).filter(Boolean); // Remove null entries for categories with no visible subcategories
  };

  return (
    <div className="w-full">
      <Accordion 
        type="multiple" 
        value={expandedCategories}
        className="w-full"
      >
        {renderSubcategories()}
      </Accordion>
    </div>
  );
}
