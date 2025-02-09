
import type { Option } from '@/types/guitar';

export const PAIRED_OPTIONS: Record<number, number> = {
  1012: 1011, // Volume + Tone Chrome pairs with Black
  1011: 1012, // Volume + Tone Black pairs with Chrome
  731: 999,   // Volume Knob Black pairs with Chrome
  999: 731,   // Volume Knob Chrome pairs with Black
  112: 996,   // Hipshot Fixed Bridge Black pairs with Chrome
  996: 112,   // Hipshot Fixed Bridge Chrome pairs with Black
  102: 997,   // Hipshot Tuners Black pairs with Chrome
  997: 102,   // Hipshot Tuners Chrome pairs with Black
};

export const getSubcategoryIdForOption = (optionId: number, categories: Category[]) => {
  const allOptions = categories?.flatMap(cat => 
    cat.subcategories.flatMap(sub => sub.options)
  ) || [];
  return allOptions.find(opt => opt.id === optionId)?.id_related_subcategory;
};

export const handlePairedSelections = (
  currentSelections: Record<number, number>,
  categories: Category[]
) => {
  let newSelections = { ...currentSelections };
  
  Object.entries(currentSelections).forEach(([subcategoryId, optionId]) => {
    const pairedOptionId = PAIRED_OPTIONS[optionId];
    if (pairedOptionId) {
      const pairedSubcategoryId = getSubcategoryIdForOption(pairedOptionId, categories);
      if (pairedSubcategoryId) {
        newSelections[pairedSubcategoryId] = pairedOptionId;
      }
    }
  });

  return newSelections;
};

export const findSelectedOptionBySubcategory = (
  subcategoryId: number,
  options: Option[],
  userSelections: Record<number, number>
) => {
  const selectedId = userSelections[subcategoryId];
  return options.find(opt => opt.id === selectedId);
};

export const findAnySelectedOptionByValue = (
  optionValue: string,
  allOptions: Option[],
  userSelections: Record<number, number>
) => {
  const selectedIds = Object.values(userSelections);
  return allOptions.find(opt => selectedIds.includes(opt.id) && opt.option === optionValue);
};

export interface Category {
  id: number;
  category: string;
  sort_order: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  subcategory: string;
  sort_order: number;
  options: Option[];
  hidden: boolean;
  id_related_category: number;
}
