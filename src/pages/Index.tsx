import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { LoginModal } from '@/components/LoginModal';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { CSSTransition } from 'react-transition-group';
import { Menu as CustomMenu } from '@/components/Menu';
import { GuitarPreview } from '@/components/GuitarPreview';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Header } from '@/components/Header';
import { Option } from '@/integrations/supabase/types';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);
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
    if (auth.currentUser && !isLoading) {
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
  }, [auth.currentUser]);

  const handleOptionSelect = (option: Option) => {
    console.log("Selected option:", option);
    setSelections((prev) => ({
      ...prev,
      [option.id]: option,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-[999] w-12 h-12 flex items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Left Column */}
      <CSSTransition
        in={!isMobile || isMenuOpen}
        timeout={300}
        classNames="menu-slide"
        unmountOnExit
      >
        <div className={`
          ${isMobile ? 'fixed inset-0 z-[998] pt-16' : 'w-1/3'}
          bg-muted/30 p-8 overflow-y-auto
        `}>
          <Header 
            isMobile={isMobile} 
            isMenuOpen={isMenuOpen} 
            onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
          />
          <CustomMenu onOptionSelect={handleOptionSelect} />
        </div>
      </CSSTransition>

      {/* Right Column */}
      {isLoading ? (
        <LoadingScreen loadingProgress={loadingProgress} />
      ) : (
        <GuitarPreview selections={selections} total={total} />
      )}

      <LoginModal 
        isOpen={showLoginModal && !auth.currentUser} 
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default Index;