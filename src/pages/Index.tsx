import React from 'react';
import { Menu } from '@/components/Menu';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useGuitarStore } from '@/store/useGuitarStore';
import { GuitarPreview } from '@/components/GuitarPreview';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import menuRulesJson from "@/config/menuRules.json";

const Index = () => {
  const { hasInitialized, setCategories, setSelection, setHasInitialized } = useGuitarStore();
  const [loadingProgress, setLoadingProgress] = React.useState(0);

  const { isLoading, isError } = useQuery({
    queryKey: ['initial-data'],
    queryFn: async () => {
      try {
        console.log('Fetching initial data...');
        const [categoriesResult, subcategoriesResult] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("subcategories").select("*").order("sort_order")
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (subcategoriesResult.error) throw subcategoriesResult.error;

        const { data: optionsData, error: optionsError } = await supabase
          .from("options")
          .select("*")
          .or('active.eq.true')
          .order('zindex');

        if (optionsError) throw optionsError;

        // Process the data
        const processedOptionsData = optionsData.map(option => ({
          ...option,
          image_url: option.image_url ? 
            (option.image_url.startsWith('/') ? option.image_url : `/images/${option.image_url}`) 
            : null
        }));

        const processedCategories = categoriesResult.data
          .filter((category) => category.category !== "Other")
          .map((category) => {
            const categorySubcategories = subcategoriesResult.data
              .filter((sub) => sub.id_related_category === category.id);
            
            return {
              ...category,
              subcategories: categorySubcategories.map((subcategory) => ({
                ...subcategory,
                options: processedOptionsData
                  .filter((opt) => opt.id_related_subcategory === subcategory.id)
                  .sort((a, b) => {
                    const priceA = a.price_usd || 0;
                    const priceB = b.price_usd || 0;
                    return priceA - priceB || a.zindex - b.zindex;
                  }),
              })),
            };
          });

        setCategories(processedCategories);

        // Set default selections
        const defaultSelections = Object.entries(menuRulesJson.defaults);
        for (const [category, optionId] of defaultSelections) {
          const option = processedOptionsData.find(opt => opt.id === Number(optionId));
          if (option?.id_related_subcategory) {
            setSelection(option.id_related_subcategory, option.id, true);
          }
        }

        setHasInitialized(true);
        return processedCategories;
      } catch (error) {
        console.error('Error loading initial data:', error);
        throw error;
      }
    }
  });

  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return Math.min(prev + 10, 100);
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading || !hasInitialized) {
    return <LoadingScreen loadingProgress={loadingProgress} />;
  }

  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p>Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-screen bg-background">
      <div className="flex-[0_0_40%] border-r border-border/10 overflow-hidden flex flex-col">
        <div className="p-8">
          <img src="/images/logo-pluria-white.svg" alt="Pluria" className="h-6 w-auto" />
        </div>
        <Menu />
      </div>
      <div className="flex-[0_0_60%] overflow-hidden">
        <GuitarPreview />
      </div>
    </div>
  );
};

export default Index;
