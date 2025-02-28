
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { CSSTransition } from 'react-transition-group';
import { Menu as CustomMenu } from '@/components/Menu';
import { GuitarPreview } from '@/components/GuitarPreview';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Header } from '@/components/Header';
import type { Tables } from '@/integrations/supabase/types';
import type { Option } from '@/types/guitar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import menuRulesJson from '@/config/menu-rules.json';

const PREVIEW_HEIGHT = 'calc(100vh - 2rem)';

const handleDefaultSelections = (options: Option[]) => {
  const defaultSelections: Record<string, Option> = {};
  options.forEach(option => {
    if (option.is_default) {
      defaultSelections[option.id] = option;
    }
  });
  return defaultSelections;
};

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selections, setSelections] = useState<Record<string, Option>>({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const isMobile = useIsMobile();

  const { isLoading: isDataLoading, isError } = useQuery({
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
        setHasInitialized(true);
        return processedCategories;
      } catch (error) {
        console.error('Error loading initial data:', error);
        throw error;
      }
    }
  });

  useEffect(() => {
    const newTotal = Object.values(selections).reduce((sum, option) => 
      sum + (option?.price_usd || 0), 0);
    setTotal(newTotal);
  }, [selections]);

  useEffect(() => {
    if (isLoading) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setLoadingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleOptionSelect = (option: Option) => {
    console.log("Selected option:", option);
    setSelections((prev) => {
      const newSelections = { ...prev };
      if (option.id_related_subcategory) {
        newSelections[option.id_related_subcategory] = option;
      }
      return newSelections;
    });
  };

  const handleInitialData = (options: Option[]) => {
    const defaultSelections = handleDefaultSelections(options);
    setSelections(defaultSelections);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-[999] w-12 h-12 flex items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      <CSSTransition
        in={!isMobile || isMenuOpen}
        timeout={300}
        classNames="menu-slide"
        unmountOnExit
      >
        <div className={`
          ${isMobile ? 'fixed inset-0 z-[998] pt-16' : 'w-1/3'}
          bg-muted/30 p-8 overflow-y-auto overflow-x-hidden
          scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20
          hover:scrollbar-thumb-muted-foreground/40 scrollbar-thumb-rounded-full
        `}>
          <Header 
            isMobile={isMobile} 
            isMenuOpen={isMenuOpen} 
            onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
          />
          <CustomMenu 
            onOptionSelect={handleOptionSelect}
            onInitialData={handleInitialData}
          />
        </div>
      </CSSTransition>

      {isLoading ? (
        <LoadingScreen loadingProgress={loadingProgress} />
      ) : (
        <GuitarPreview className="" />
      )}
    </div>
  );
};

export default Index;
