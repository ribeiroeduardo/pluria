
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

const PREVIEW_HEIGHT = 'calc(100vh - 2rem)';

<<<<<<< HEAD
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

        // Check lighting options
        const lightingOptions = optionsData.filter(opt => 
          opt.id === 994 || opt.id === 995
        );
        console.log('Lighting options from database:', lightingOptions);

        // Process the data
        const processedOptionsData = optionsData.map(option => ({
          ...option,
          image_url: option.image_url ? 
            (option.image_url.startsWith('/') ? option.image_url : `/images/${option.image_url}`) 
            : null
        }));

        // Check processed lighting options
        const processedLightingOptions = processedOptionsData.filter(opt => 
          opt.id === 994 || opt.id === 995
        );
        console.log('Processed lighting options:', processedLightingOptions);

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

        // Set default selections
        const defaultSelections = Object.entries(menuRulesJson.defaults);
        console.log('Default selections:', defaultSelections);

        for (const [category, optionId] of defaultSelections) {
          const numericOptionId = Number(optionId);
          const option = processedOptionsData.find(opt => opt.id === numericOptionId);
          console.log(`Setting default for ${category}:`, { 
            optionId: numericOptionId, 
            option,
            subcategoryId: option?.id_related_subcategory,
            hasSubcategory: !!option?.id_related_subcategory
          });
          
          if (option?.id_related_subcategory) {
            console.log(`Setting selection for subcategory ${option.id_related_subcategory} with option ${numericOptionId}`);
            setSelection(option.id_related_subcategory, numericOptionId, true);
          } else {
            console.warn(`Could not find subcategory for option ${optionId} (${category})`);
          }
        }

        setHasInitialized(true);
        return processedCategories;
      } catch (error) {
        console.error('Error loading initial data:', error);
        throw error;
      }
=======
const handleDefaultSelections = (options: Option[]) => {
  const defaultSelections: Record<string, Option> = {};
  options.forEach(option => {
    if (option.is_default) {
      defaultSelections[option.id] = option;
>>>>>>> 6cac193f64153ea02503ad502bfeb98c769c6f53
    }
  });
  return defaultSelections;
};

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selections, setSelections] = useState<Record<string, Option>>({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const newTotal = Object.values(selections).reduce((sum, option) => 
      sum + (option?.price_usd || 0), 0);
    setTotal(newTotal);
  }, [selections]);

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setLoadingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 200);
    }
  }, []);

  const handleOptionSelect = (option: Option) => {
    console.log("Selected option:", option);
    setSelections((prev) => {
      // Create a new selections object
      const newSelections = { ...prev };
      
      // Remove any existing selection for the same subcategory
      Object.keys(newSelections).forEach(key => {
        if (newSelections[key]?.id_related_subcategory === option.id_related_subcategory) {
          delete newSelections[key];
        }
      });
      
      // Add the new selection
      newSelections[option.id_related_subcategory] = option;
      
      return newSelections;
    });
  };

  // Handle initial default selections when menu data is loaded
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
        <GuitarPreview selections={selections} total={total} />
      )}
    </div>
  );
};

export default Index;
