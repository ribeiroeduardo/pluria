import React from 'react';
import { X } from 'lucide-react';
import { useGuitarConfig } from '@/contexts/GuitarConfigContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTitle, SheetClose } from '@/components/ui/sheet';
interface PriceSummarySheetProps {
  isOpen: boolean;
  onClose: () => void;
}
export function PriceSummarySheet({
  isOpen,
  onClose
}: PriceSummarySheetProps) {
  const {
    configuration,
    categories,
    subcategories,
    isOptionHidden
  } = useGuitarConfig();
  const {
    currentCurrency,
    convertPrice
  } = useCurrency();
  const isMobile = useIsMobile();

  // Group selected options by category and maintain menu order
  const groupedOptions = React.useMemo(() => {
    // First, create a map of all categories with their options
    const groups = new Map(categories.filter(category => category.category !== "Other").map(category => [category.id, {
      category: category.category,
      items: []
    }]));

    // Then fill in the selected options
    Array.from(configuration.selectedOptions.entries()).forEach(([subcategoryId, option]) => {
      // Skip hidden options
      if (isOptionHidden(option)) return;
      const subcategory = subcategories.find(sub => sub.id === subcategoryId);
      if (!subcategory) return;
      const category = categories.find(cat => cat.id === subcategory.id_related_category);
      if (!category || category.category === "Other") return;
      const group = groups.get(category.id);
      if (!group) return;
      const priceInUSD = option.price_usd || 0;
      const convertedPrice = convertPrice(priceInUSD, 'USD', currentCurrency);
      group.items.push({
        subcategory: subcategory.subcategory,
        option: option.option,
        price: convertedPrice
      });
    });

    // Convert to array and filter out empty categories
    return Array.from(groups.values()).filter(group => group.items.length > 0);
  }, [configuration.selectedOptions, categories, subcategories, isOptionHidden, currentCurrency, convertPrice]);

  // Calculate total only from visible options
  const visibleTotal = React.useMemo(() => {
    const totalUSD = Array.from(configuration.selectedOptions.values()).filter(option => !isOptionHidden(option)).reduce((total, option) => total + (option.price_usd || 0), 0);
    return convertPrice(totalUSD, 'USD', currentCurrency);
  }, [configuration.selectedOptions, isOptionHidden, currentCurrency, convertPrice]);
  const formatPrice = (price: number) => {
    const currencySymbol = currentCurrency === 'USD' ? '$' : 'R$';
    return `${currencySymbol}${price.toLocaleString(currentCurrency === 'USD' ? 'en-US' : 'pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  return <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className={cn("flex flex-col bg-black border-t border-zinc-800 text-white p-0 gap-0", isMobile ? "w-full h-[100dvh]" : "left-0 w-[35%] h-[100vh] rounded-t-xl")}>
        {/* Header - Fixed */}
        <div className="flex-none p-6 border-b border-zinc-800 py-[16px]">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-xl">Summary</SheetTitle>
            <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-zinc-400 hover:text-white">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-grow px-6 py-4 h-full">
          <div className="space-y-6">
            {groupedOptions.map((group, index) => <div key={index} className="space-y-2">
                <h3 className="text-zinc-400 my-0 py-[5px] font-bold text-base">{group.category}</h3>
                <div className="space-y-2">
                  {group.items.map((item, itemIndex) => <div key={itemIndex} className="space-y-1">
                      <p className="text-zinc-300 text-xs">{item.subcategory}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-zinc-500 text-xs">{item.option}</p>
                        {item.price > 0 && <span className="text-zinc-400 text-xs">
                            {formatPrice(item.price)}
                          </span>}
                      </div>
                    </div>)}
                </div>
              </div>)}
          </div>
        </ScrollArea>

        {/* Footer with total - Fixed */}
        <div className="flex-none p-6 border-t border-zinc-800">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total</span>
            <span className="text-sm font-semibold">
              {formatPrice(visibleTotal)}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>;
}