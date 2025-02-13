import React from "react";
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { ConfigurationError } from '@/types/guitar'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

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
      <div className="p-4 text-sm animate-pulse">
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
      <div className="flex-1 overflow-y-auto">
        <form className="py-6 space-y-10" onSubmit={(e) => e.preventDefault()}>
          {filteredCategories.map((category) => (
            <section key={category.id} className="space-y-4">
              <h2 className="text-base font-medium text-center">
                {category.category}
              </h2>
              {category.subcategories.map((subcategory) => {
                const options = getSubcategoryOptions(subcategory.id)
                // Skip rendering subcategory if all its options are hidden
                if (options.length === 0) return null

                const selectedOption = configuration.selectedOptions.get(subcategory.id)

                return (
                  <div key={subcategory.id} className="space-y-2">
                    <div className="flex items-center justify-between px-6 text-sm">
                      <span>{subcategory.subcategory}</span>
                    </div>
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
                            {option.price_usd ? (
                              <span className="text-sm text-zinc-500">
                                {option.price_usd > 0 ? '+' : ''}${option.price_usd.toLocaleString('en-US', {
                                  minimumFractionDigits: option.price_usd >= 1000 ? 2 : 0,
                                  maximumFractionDigits: option.price_usd >= 1000 ? 2 : 0
                                })}
                              </span>
                            ) : null}
                          </label>
                        )
                      })}
                    </RadioGroup>
                  </div>
                )
              })}
            </section>
          ))}
        </form>
      </div>

      {/* Price Summary */}
      <div className="border-t border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="px-6 py-4 flex justify-between items-center">
          <span className="text-sm font-medium">Total Price:</span>
          <span className="text-lg font-semibold">${configuration.totalPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</span>
        </div>
      </div>
    </div>
  )
}
