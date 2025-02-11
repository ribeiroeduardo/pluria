import React from 'react'
import { Option } from '@/types/guitar'
import { useGuitarStore } from '@/store/useGuitarStore'
import { shouldHideOption, isOptionDisabled, shouldHideSubcategory } from '@/utils/ruleProcessor'
import { usePreviewUpdates } from '@/hooks/usePreviewUpdates'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface OptionGroupProps {
  subcategoryId: number
  options: Option[]
  label: string
  onOptionSelect: (option: Option) => void
}

export function OptionGroup({ subcategoryId, options, label, onOptionSelect }: OptionGroupProps) {
  const { 
    userSelections, 
    setSelection,
    woodSelections,
    setWoodSelection
  } = useGuitarStore()

  const { updatePreview } = usePreviewUpdates({ onOptionSelect, options })

  const selectedOptionId = userSelections[subcategoryId]

  // Check if this subcategory should be hidden based on wood selections
  if (shouldHideSubcategory(subcategoryId, woodSelections)) {
    return null
  }

  const handleOptionChange = (optionId: string) => {
    const option = options.find(opt => opt.id === parseInt(optionId))
    if (!option) return

    // Handle wood selections
    if (option.id === 55) {
      setWoodSelection('isBuckeyeBurlSelected', true)
    } else if (option.id === 244) {
      setWoodSelection('isFlamedMapleSelected', true)
    } else if (option.id === 53) {
      setWoodSelection('isMapleBurlSelected', true)
    } else if (option.id === 59) {
      setWoodSelection('isQuiltedMapleSelected', true)
    } else if (option.id === 91) {
      setWoodSelection('isPaulowniaSelected', true)
    }

    // Update selection in store
    setSelection(subcategoryId, option.id)

    // Update preview
    updatePreview(option.id)
  }

  return (
    <div className="py-2 px-4">
      <RadioGroup
        value={selectedOptionId?.toString()}
        onValueChange={handleOptionChange}
        className="grid gap-1"
      >
        {options.map((option) => {
          const isHidden = shouldHideOption(option.id, userSelections, woodSelections)
          const isDisabled = isOptionDisabled(option.id, userSelections, woodSelections)

          if (isHidden) return null

          return (
            <div 
              key={option.id} 
              className="relative flex items-center h-12 hover:bg-muted/50 rounded-sm transition-colors group"
              onClick={() => !isDisabled && handleOptionChange(option.id.toString())}
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <RadioGroupItem
                  value={option.id.toString()}
                  id={`option-${option.id}`}
                  disabled={isDisabled}
                  className="h-4 w-4"
                />
              </div>
              <Label
                htmlFor={`option-${option.id}`}
                className={`pl-10 pr-4 py-3 w-full cursor-pointer text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  isDisabled ? 'text-muted-foreground cursor-not-allowed' : ''
                }`}
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