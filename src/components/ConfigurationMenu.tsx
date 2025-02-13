import React from 'react';
import { useGuitarConfig } from '@/contexts/GuitarConfigContext';
import { formatCurrency } from '@/utils/currency';

export function ConfigurationMenu() {
  const {
    categories,
    subcategories,
    configuration,
    loading,
    error,
    setOption,
    getSubcategoryOptions,
  } = useGuitarConfig();

  if (loading) {
    return <div className="p-3 text-sm">Loading configuration...</div>;
  }

  if (error) {
    return <div className="p-3 text-sm text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-3">
      {categories.map(category => {
        const categorySubcategories = subcategories.filter(
          sub => sub.id_related_category === category.id
        );

        return (
          <div key={category.id} className="mb-6">
            <h2 className="text-base font-semibold mb-3">{category.name}</h2>
            {categorySubcategories.map(subcategory => {
              const options = getSubcategoryOptions(subcategory.id);
              const selectedOption = configuration.selectedOptions.get(subcategory.id);

              return (
                <div key={subcategory.id} className="mb-4">
                  <h3 className="text-sm font-medium mb-2">{subcategory.name}</h3>
                  <div className="grid grid-cols-1 gap-1.5">
                    {options.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setOption(subcategory.id, option)}
                        className={`p-2.5 rounded-lg transition-colors text-sm ${
                          selectedOption?.id === option.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{option.name}</span>
                          <span className="font-medium">
                            {formatCurrency(option.price_usd)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <span className="text-sm font-semibold">Total:</span>
          <span className="text-base font-semibold">
            {formatCurrency(configuration.totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
} 