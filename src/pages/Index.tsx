
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { CSSTransition } from 'react-transition-group';
import { Menu as CustomMenu } from '@/components/Menu';
import { GuitarPreview } from '@/components/GuitarPreview';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isMobile = useIsMobile();

  // Use this query just to preload data
  useQuery({
    queryKey: ['preload-data'],
    queryFn: async () => {
      try {
        const [categoriesResult, subcategoriesResult, optionsResult] = await Promise.all([
          supabase.from('categories').select('*').order('sort_order'),
          supabase.from('subcategories').select('*').order('sort_order'),
          supabase.from('options').select('*').or('active.eq.true').order('zindex')
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (subcategoriesResult.error) throw subcategoriesResult.error;
        if (optionsResult.error) throw optionsResult.error;

        return {
          categories: categoriesResult.data,
          subcategories: subcategoriesResult.data,
          options: optionsResult.data
        };
      } catch (error) {
        console.error('Error loading initial data:', error);
        throw error;
      }
    }
  });

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
          <CustomMenu />
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
