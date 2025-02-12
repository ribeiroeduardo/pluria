import React from 'react';
import type { Option } from '@/types/guitar';
import { useGuitarStore } from '@/store/useGuitarStore';

export const Total = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { userSelections, categories } = useGuitarStore();

  // Get selected options and calculate total
  const { selectedOptions, total } = React.useMemo(() => {
    const options = Object.values(userSelections).map(sel => {
      for (const category of categories) {
        for (const subcategory of category.subcategories) {
          const option = subcategory.options.find(opt => opt.id === sel.optionId);
          if (option) return option;
        }
      }
      return null;
    }).filter((opt): opt is Option => opt !== null);

    // Calculate total price
    const totalPrice = options.reduce((sum, option) => {
      return sum + (option.price_usd || 0);
    }, 0);

    return {
      selectedOptions: options,
      total: totalPrice
    };
  }, [userSelections, categories]);

  return (
    <div className="absolute top-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg w-64 text-xs z-[9999]">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-medium">Total</span>
        <div className="flex items-center gap-2">
          <span className="font-medium">
            ${total.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <>
          <div className="mt-4 pt-2 border-t border-white/20" />
          <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40">
            {selectedOptions.map((option) => (
              <div key={option.id} className="space-y-0.5">
                <div className="font-medium">{option.option}</div>
                {option.price_usd !== null && (
                  <div className="text-white/50">
                    +${option.price_usd.toLocaleString('en-US', {
                      minimumFractionDigits: option.price_usd >= 1000 ? 2 : 0,
                      maximumFractionDigits: option.price_usd >= 1000 ? 2 : 0
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}; 