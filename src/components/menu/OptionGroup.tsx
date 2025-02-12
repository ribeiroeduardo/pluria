import React from 'react'
import { Option } from '@/types/guitar'
import { useGuitarStore } from '@/store/useGuitarStore'
import { shouldHideOption } from '@/utils/ruleProcessor'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'

interface OptionGroupProps {
  subcategoryId: number
  options: Option[]
  label: string
  selectedOptionId?: number
}

export function OptionGroup({ subcategoryId, options, label, selectedOptionId: propSelectedOptionId }: OptionGroupProps) {
  const { 
    userSelections, 
    setSelection
  } = useGuitarStore()

  // Use prop selectedOptionId if provided, otherwise fallback to store value
  const selectedOptionId = propSelectedOptionId ?? userSelections[subcategoryId]?.optionId

  const handleOptionChange = (optionId: string) => {
    const option = options.find(opt => opt.id === parseInt(optionId))
    if (!option) return

    // Update selection in store
    setSelection(subcategoryId, option.id)
  }

  return (
    <div className="py-2 px-4">
      <RadioGroup
        value={selectedOptionId?.toString()}
        onValueChange={handleOptionChange}
        className="grid gap-1"
      >
        {options.map((option) => {
          const isHidden = shouldHideOption(option.id, userSelections)
          const isSelected = selectedOptionId === option.id

          if (isHidden) return null

          return (
            <div 
              key={option.id} 
              className={`
                relative flex items-center h-10 rounded-sm transition-colors group
                ${isSelected ? 'bg-muted/50' : 'hover:bg-muted/50'}
              `}
              onClick={() => handleOptionChange(option.id.toString())}
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <RadioGroupItem
                  value={option.id.toString()}
                  id={`option-${option.id}`}
                  className="h-4 w-4"
                />
              </div>
              {isSelected && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Check className="h-4 w-4 text-red-500" />
                </div>
              )}
              <Label
                htmlFor={`option-${option.id}`}
                className={`
                  pl-10 pr-10 py-3 w-full cursor-pointer text-xs leading-none 
                  peer-disabled:cursor-not-allowed peer-disabled:opacity-70
                  ${isSelected ? 'font-medium' : ''}
                `}
              >
                {option.option}
                {option.price_usd ? (
                  <span className="ml-1 text-xs text-muted-foreground">(+${option.price_usd})</span>
                ) : null}
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
} 