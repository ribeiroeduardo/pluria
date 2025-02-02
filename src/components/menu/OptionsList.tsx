import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Subcategory } from "./types";

interface OptionsListProps {
  subcategory: Subcategory;
  userSelections: Record<number, number>;
  onOptionSelect: (option: Option) => void;
}

export function OptionsList({ subcategory, userSelections, onOptionSelect }: OptionsListProps) {
  return (
    <RadioGroup
      value={userSelections[subcategory.id]?.toString()}
      onValueChange={(value) => {
        const option = subcategory.options.find(
          (opt) => opt.id.toString() === value
        );
        if (option) {
          onOptionSelect(option);
        }
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
  );
}