
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
