
import type { Option } from '@/types/guitar';

export const getSubcategoryIdForOption = (optionId: number, categories: Category[]) => {
  const allOptions = categories?.flatMap(cat => 
    cat.subcategories.flatMap(sub => sub.options)
  ) || [];
  return allOptions.find(opt => opt.id === optionId)?.id_related_subcategory;
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
