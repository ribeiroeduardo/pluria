import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Subcategory } from "@/types/menu";

interface SubcategoryMenuProps {
  subcategory: Subcategory;
  selectedValue?: number;
  onOptionSelect: (optionId: number) => void;
}

export const SubcategoryMenu = ({ 
  subcategory, 
  selectedValue,
  onOptionSelect 
}: SubcategoryMenuProps) => {
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
        <RadioGroup
          value={selectedValue?.toString()}
          onValueChange={(value) => {
            onOptionSelect(Number(value));
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
  );
};