import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { Database } from '@/integrations/supabase/types';
import type { Option } from '@/types/menu';

type OptionsQuery = PostgrestFilterBuilder<
  Database['public'],
  Database['public']['Tables']['options']['Row'],
  Database['public']['Tables']['options']['Row'][],
  'options'
>;

export const applyFilters = (
  query: OptionsQuery,
  selectedOptionId: number | null
): OptionsQuery => {
  if (!selectedOptionId) {
    return query;
  }

  console.log("Selected option for filter:", selectedOptionId);

  // Apply filters based on selected option
  if (selectedOptionId === 370) { // 7-string filter
    return query.or('strings.eq.7,strings.eq.all,strings.is.null');
  }

  console.log("Applied filter query:", query.toSQL());

  return query;
};

export const getDefaultSelections = (options: Option[]) => {
  const defaultSelections: Record<number, number> = {};
  
  options.forEach(option => {
    if (option.is_default && option.id_related_subcategory) {
      defaultSelections[option.id_related_subcategory] = option.id;
    }
  });
  
  return defaultSelections;
};