import React from "react";
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Menu as MenuIcon, X } from 'lucide-react'
import type { ConfigurationError } from '@/types/guitar'
import { cn } from '@/lib/utils'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { shouldHideSubcategory } from '@/utils/filterRules'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { PriceSummarySheet } from '@/components/PriceSummarySheet'

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

  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [openSubcategories, setOpenSubcategories] = React.useState<string[]>([])
  const [isPriceSummaryOpen, setIsPriceSummaryOpen] = React.useState(false)

  if (loading) {
    return (
      <div className={cn(
        "p-4 text-xs animate-pulse",
        !isMobile && "w-full"
      )}>
        Loading configuration...
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className={cn(
        "m-4",
        !isMobile && "w-full"
      )}>
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
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-black/80 hover:bg-black text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </Button>
      )}

      {/* Menu Container */}
      <div
        className={cn(
          "flex flex-col bg-black text-white",
          isMobile 
            ? "fixed inset-y-0 left-0 z-40 w-full transition-transform duration-300 ease-in-out h-full"
            : "w-full h-screen",
          isMobile && !isMenuOpen && "-translate-x-full"
        )}
      >
        <div className={cn(
          "p-6 border-b border-zinc-800",
          isMobile && "flex items-center pl-16"
        )}>
          <img src="/images/logo-pluria-white.svg" alt="Pluria" className="h-6" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <form className="pb-6" onSubmit={(e) => e.preventDefault()}>
            <Accordion type="multiple" className="space-y-2">
              {filteredCategories.map((category) => (
                <AccordionItem key={category.id} value={`category-${category.id}`} className="border-none">
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-zinc-800/50">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isMobile ? "max-w-[200px]" : "max-w-[300px]"
                    )}>{category.category}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pt-1">
                      <Accordion 
                        type="multiple" 
                        value={openSubcategories}
                        onValueChange={(value) => {
                          const newValue = value[value.length - 1];
                          if (newValue && !openSubcategories.includes(newValue)) {
                            setOpenSubcategories([newValue]);
                          } else {
                            setOpenSubcategories([]);
                          }
                        }}
                        className="space-y-1"
                      >
                        {category.subcategories.map((subcategory) => {
                          const options = getSubcategoryOptions(subcategory.id)
                          const selectedOption = configuration.selectedOptions.get(subcategory.id)
                          
                          if (shouldHideSubcategory(subcategory, configuration.selectedOptions)) {
                            return null
                          }

                          return (
                            <AccordionItem key={subcategory.id} value={`subcategory-${subcategory.id}`} className="border-none">
                              <AccordionTrigger className="px-6 hover:no-underline hover:bg-zinc-800/50">
                                <div className="flex justify-between items-center w-full">
                                  <span className={cn(
                                    "text-xs truncate",
                                    isMobile ? "max-w-[150px]" : "max-w-[250px]"
                                  )}>{subcategory.subcategory}</span>
                                  {selectedOption && (
                                    <span className={cn(
                                      "text-xs text-zinc-400 mr-4 truncate",
                                      isMobile ? "max-w-[150px]" : "max-w-[250px]"
                                    )}>{selectedOption.option}</span>
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <RadioGroup
                                  value={selectedOption?.id?.toString()}
                                  onValueChange={(value) => {
                                    const option = options.find(opt => opt.id.toString() === value)
                                    if (option) {
                                      setOption(subcategory.id, option)
                                      setOpenSubcategories([])
                                      if (isMobile) {
                                        setIsMenuOpen(false)
                                      }
                                    }
                                  }}
                                  className="px-6 space-y-1 pt-2"
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
                                          <span className={cn(
                                            "text-xs truncate",
                                            isMobile ? "max-w-[200px]" : "max-w-[300px]"
                                          )}>{option.option}</span>
                                        </div>
                                        {option.price_usd > 0 && (
                                          <span className="text-xs text-zinc-400">
                                            ${option.price_usd.toLocaleString('en-US', {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2
                                            })}
                                          </span>
                                        )}
                                      </label>
                                    )
                                  })}
                                </RadioGroup>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>
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
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium">Total:</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-zinc-400 hover:text-zinc-300"
                onClick={() => setIsPriceSummaryOpen(true)}
              >
                View Summary
              </Button>
            </div>
            <span className="text-sm font-semibold">${configuration.totalPrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</span>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Price Summary Sheet */}
      <PriceSummarySheet 
        isOpen={isPriceSummaryOpen} 
        onClose={() => setIsPriceSummaryOpen(false)} 
      />
    </>
  )
}
