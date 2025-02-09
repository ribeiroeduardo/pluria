
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Option } from '@/types/guitar';
import type { Subcategory } from '@/utils/menuUtils';
import { shouldHideOption, getHardwareOptionToShow } from '@/utils/hardwareRules';

interface OptionRadioGroupProps {
  subcategory: Subcategory;
  userSelections: Record<number, number>;
  onOptionSelect: (option: Option) => void;
  getSubcategoryIdForOption: (optionId: number) => number | undefined;
}

export const OptionRadioGroup = ({
  subcategory,
  userSelections,
  onOptionSelect,
  getSubcategoryIdForOption,
}: OptionRadioGroupProps) => {
  // Filter out options that should be hidden based on hardware rules
  const visibleOptions = subcategory.options.filter(
    option => !shouldHideOption(option.id, userSelections)
  );

  const handleValueChange = (value: string) => {
    const selectedOption = subcategory.options.find(
      (opt) => opt.id.toString() === value
    );
    
    if (selectedOption) {
      const hardwareOptionToShow = getHardwareOptionToShow(selectedOption.id, userSelections);
      
      if (hardwareOptionToShow) {
        const replacementOption = subcategory.options.find(
          opt => opt.id === hardwareOptionToShow
        );
        if (replacementOption) {
          onOptionSelect(replacementOption);
          return;
        }
      }
      
      onOptionSelect(selectedOption);
    }
  };

  return (
    <RadioGroup
      value={userSelections[subcategory.id]?.toString()}
      onValueChange={handleValueChange}
      className="flex flex-col gap-1.5 pl-4"
    >
      {visibleOptions.map((option) => {
        const isSelected = userSelections[subcategory.id] === option.id;

        return (
          <div 
            key={option.id}
            className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-muted/50 transition-colors"
          >
            <RadioGroupItem
              value={option.id.toString()}
              id={`option-${option.id}`}
              checked={isSelected}
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
        );
      })}
    </RadioGroup>
  );
};
