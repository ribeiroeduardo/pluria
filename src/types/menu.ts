import type { Database } from '@/integrations/supabase/types'

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
  hidden: string;
}

export type Option = Database['public']['Tables']['options']['Row'];

export interface FilterConfig {
  id: number;
  type: 'strings' | 'scale_length';
  condition: string[];
}