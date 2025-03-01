import React from 'react'
import { X } from 'lucide-react'
import { useGuitarConfig } from '@/contexts/GuitarConfigContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useIsMobile } from '@/hooks/use-mobile'
import { CurrencyToggle } from './CurrencyToggle'

interface PriceSummarySheetProps {
  isOpen: boolean
  onClose: () => void
}

export function PriceSummarySheet({ isOpen, onClose }: PriceSummarySheetProps) {
  const { configuration, categories, subcategories, isOptionHidden } = useGuitarConfig()
  const { currentCurrency, convertPrice } = useCurrency()
  const isMobile = useIsMobile()

  // Group selected options by category and maintain menu order
  const groupedOptions = React.useMemo(() => {
    // First, create a map of all categories with their options
    const groups = new Map(
      categories
        .filter(category => category.category !== "Other")
        .map(category => [
          category.id,
          {
            category: category.category,
            items: []
          }
        ])
    )

    // Then fill in the selected options
    Array.from(configuration.selectedOptions.entries()).forEach(([subcategoryId, option]) => {
      // Skip hidden options
      if (isOptionHidden(option)) return

      const subcategory = subcategories.find(sub => sub.id === subcategoryId)
      if (!subcategory) return

      const category = categories.find(cat => cat.id === subcategory.id_related_category)
      if (!category || category.category === "Other") return

      const group = groups.get(category.id)
      if (!group) return

      const priceInUSD = option.price_usd || 0
      const convertedPrice = convertPrice(priceInUSD, 'USD', currentCurrency)

      group.items.push({
        subcategory: subcategory.subcategory,
        option: option.option,
        price: convertedPrice
      })
    })

    // Convert to array and filter out empty categories
    return Array.from(groups.values()).filter(group => group.items.length > 0)
  }, [configuration.selectedOptions, categories, subcategories, isOptionHidden, currentCurrency, convertPrice])

  // Calculate total only from visible options
  const visibleTotal = React.useMemo(() => {
    const totalUSD = Array.from(configuration.selectedOptions.values())
      .filter(option => !isOptionHidden(option))
      .reduce((total, option) => total + (option.price_usd || 0), 0)
    
    return convertPrice(totalUSD, 'USD', currentCurrency)
  }, [configuration.selectedOptions, isOptionHidden, currentCurrency, convertPrice])

  const formatPrice = (price: number) => {
    const currencySymbol = currentCurrency === 'USD' ? '$' : 'R$'
    return `${currencySymbol}${price.toLocaleString(currentCurrency === 'USD' ? 'en-US' : 'pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60]"
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-y-0 z-[60] flex flex-col bg-black border-r border-zinc-800 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-y-0" : "translate-y-full",
          isMobile ? "inset-x-0" : "left-0 w-[35%]"
        )}
      >
        {/* Header - Fixed */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-zinc-800 bg-black">
          <h2 className="text-sm font-medium">Price Summary</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Currency Toggle */}
        <div className="flex-none p-4 border-b border-zinc-800 bg-black">
          <CurrencyToggle />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {groupedOptions.map((group, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xs font-medium text-zinc-400">{group.category}</h3>
                <div className="space-y-2">
                  {group.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-start text-xs">
                      <div className="space-y-1">
                        <p className="text-zinc-300">{item.subcategory}</p>
                        <p className="text-zinc-500">{item.option}</p>
                      </div>
                      {item.price > 0 && (
                        <span className="text-zinc-400">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with total */}
        <div className="flex-none p-4 border-t border-zinc-800 bg-black">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total</span>
            <span className="text-sm font-semibold">
              {formatPrice(visibleTotal)}
            </span>
          </div>
        </div>
      </div>
    </>
  )
} 