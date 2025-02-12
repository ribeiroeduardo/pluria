// Suppress console logs
const originalLog = console.log;
console.log = (...args: any[]) => {
  const suppressedMessages = [
    'Download the React DevTools',
    'Download the Vue Devtools extension',
    'You are running Vue in development mode',
  ];
  const shouldSuppress = suppressedMessages.some((message) =>
    args[0] && args[0].includes(message)
  );
  if (!shouldSuppress) {
    originalLog(...args);
  }
};

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { CSSTransition } from 'react-transition-group';
import { Menu as CustomMenu } from '@/components/Menu';
import { GuitarPreview } from '@/components/GuitarPreview';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Header } from '@/components/Header';
import type { Option } from '@/types/guitar';
import { useGuitarStore } from '@/store/useGuitarStore';

const PREVIEW_HEIGHT = 'calc(100vh - 2rem)';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selections, setSelections] = useState<Record<number, Option>>({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isMobile = useIsMobile();
  const { userSelections } = useGuitarStore();

  const handleOptionSelect = (option: Option) => {
    setSelections((prev) => ({
      ...prev,
      [option.id]: option,
    }));

    // Update total price
    setTotal((prevTotal) => {
      const price = option.price_usd || 0;
      return prevTotal + price;
    });
  };

  // Handle initial data when menu is loaded
  const handleInitialData = (options: Option[]) => {
    // Create a map of all available options for faster lookup
    const optionsMap = new Map<number, Option>();
    options.forEach(option => {
      optionsMap.set(option.id, option);
    });

    // Update selections and total
    const initialSelections: Record<number, Option> = {};
    let initialTotal = 0;

    // Process all options that have images
    options.forEach(option => {
      if (option.image_url) {
        initialSelections[option.id] = option;
        initialTotal += option.price_usd || 0;
      }
    });

    console.log('Initial selections being set:', initialSelections);
    setSelections(initialSelections);
    setTotal(initialTotal);

    // Delay setting isLoading to false to ensure all selections are processed
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  // Effect to sync selections with store
  useEffect(() => {
    if (!isLoading) {
      const newSelections: Record<number, Option> = {};
      let newTotal = 0;

      // Create a map of all available options for faster lookup
      const optionsMap = new Map<number, Option>();
      Object.values(selections).forEach(option => {
        optionsMap.set(option.id, option);
      });

      Object.values(userSelections).forEach(({ optionId }) => {
        const option = optionsMap.get(optionId);
        if (option) {
          newSelections[option.id] = option;
          newTotal += option.price_usd || 0;
        }
      });

      console.log('Syncing selections with store:', newSelections);
      setSelections(newSelections);
      setTotal(newTotal);
    }
  }, [userSelections, isLoading]);

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
          bg-muted/30 overflow-y-auto overflow-x-hidden
          scrollbar scrollbar-w-2 scrollbar-track-transparent
          scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20
          scrollbar-thumb-rounded-full
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
