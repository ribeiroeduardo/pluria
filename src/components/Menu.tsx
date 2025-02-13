import React from "react";
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { ConfigurationError } from '@/types/guitar'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { shouldHideSubcategory } from '@/utils/filterRules'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export function Menu() {
  const {
    configuration,
    loading,
    error,
    categories,
    subcategories,
    getConfigurationErrors,
    getSubcategoryOptions,
    setOption,
    isOptionHidden
  } = useGuitarConfig()

  if (loading) {
    return (
      <div className="p-4 text-xs animate-pulse">
        Loading configuration...
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading menu: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  // Filter and organize categories
  const filteredCategories = categories
    .filter(category => category.category !== "Other")
    .map(category => ({
      ...category,
      subcategories: subcategories
        .filter(sub => sub.id_related_category === category.id)
    }))

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="p-6 border-b border-zinc-800">
        <img src="/images/logo-pluria-white.svg" alt="Pluria" className="h-6" />
      </div>
      <div className="flex-1 overflow-y-auto">
        <form className="py-6" onSubmit={(e) => e.preventDefault()}>
          <Accordion type="multiple" className="space-y-4">
            {filteredCategories.map((category) => (
              <AccordionItem key={category.id} value={`category-${category.id}`} className="border-none">
                <AccordionTrigger className="px-6 hover:no-underline hover:bg-zinc-800/50">
                  <span className="text-sm font-medium">{category.category}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {category.subcategories.map((subcategory) => {
                      const options = getSubcategoryOptions(subcategory.id)
                      const selectedOption = configuration.selectedOptions.get(subcategory.id)
                      
                      // Check if subcategory should be hidden
                      if (shouldHideSubcategory(subcategory, configuration.selectedOptions)) {
                        return null
                      }

                      return (
                        <AccordionItem key={subcategory.id} value={`subcategory-${subcategory.id}`} className="border-none">
                          <AccordionTrigger className="px-6 hover:no-underline hover:bg-zinc-800/50">
                            <span className="text-xs">{subcategory.subcategory}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <RadioGroup
                              value={selectedOption?.id?.toString()}
                              onValueChange={(value) => {
                                const option = options.find(opt => opt.id.toString() === value)
                                if (option) {
                                  setOption(subcategory.id, option)
                                }
                              }}
                              className="px-6 space-y-1"
                            >
                              {options.map((option) => {
                                const isHidden = isOptionHidden(option)
                                if (isHidden) return null

                                return (
                                  <label
                                    key={option.id}
                                    className={cn(
                                      "flex items-center justify-between w-full p-2 rounded cursor-pointer hover:bg-zinc-800/50",
                                      selectedOption?.id === option.id && "bg-zinc-800"
                                    )}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                                      <span className="text-sm">{option.option}</span>
                                    </div>
                                  </label>
                                )
                              })}
                            </RadioGroup>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </form>
      </div>

      {/* Price Summary */}
      <div className="p-6 border-t border-zinc-800 bg-black">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium">Total Price:</span>
          <span className="text-sm font-semibold">${configuration.totalPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</span>
        </div>
      </div>
    </div>
  )
}
