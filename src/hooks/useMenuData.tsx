
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Option } from '@/types/guitar';
import type { Category } from '@/utils/menuUtils';

export const useMenuData = (onInitialData: (options: Option[]) => void) => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const [categoriesResult, subcategoriesResult] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("subcategories")
            .select("*")
            .not('id', 'in', '(5,34,35)')
            .or('hidden.is.null,hidden.eq.false')
            .order("sort_order")
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (subcategoriesResult.error) throw subcategoriesResult.error;

        const { data: optionsData, error: optionsError } = await supabase
          .from("options")
          .select("*")
          .eq("active", true)
          .order('zindex');

        if (optionsError) throw optionsError;

        const processedOptionsData = optionsData.map(option => ({
          ...option,
          image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
        }));

        onInitialData(processedOptionsData);

        return categoriesResult.data
          .filter((category) => category.category !== "Other")
          .map((category) => ({
            ...category,
            subcategories: subcategoriesResult.data
              .filter((sub) => sub.id_related_category === category.id)
              .map((subcategory) => ({
                ...subcategory,
                options: processedOptionsData
                  .filter((opt) => opt.id_related_subcategory === subcategory.id)
                  .sort((a, b) => {
                    const priceA = a.price_usd || 0;
                    const priceB = b.price_usd || 0;
                    return priceA - priceB || a.zindex - b.zindex;
                  }),
              })),
          }));
      } catch (error) {
        console.error('Error in queryFn:', error);
        throw error;
      }
    },
  });
};
