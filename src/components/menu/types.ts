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
}

export interface Option {
  id: number;
  option: string;
  price_usd: number | null;
  active: boolean;
  is_default: boolean;
  id_related_subcategory: number;
  strings?: string;
  scale_length?: string;
}