import type { Tables } from '@/integrations/supabase/types'

export interface Option extends Tables<'options'> {
  subcategory?: string;
}

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