import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { LoginModal } from '@/components/LoginModal';
import { CustomizerForm } from '@/components/CustomizerForm';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { CSSTransition } from 'react-transition-group';
import { useToast } from '@/hooks/use-toast';

interface Option {
  label: string;
  price: number;
  image?: string;
}

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [selections, setSelections] = useState<Record<string, Option>>({});
  const [total, setTotal] = useState(0);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    const newTotal = Object.values(selections).reduce((sum, option) => 
      sum + (option?.price || 0), 0);
    setTotal(newTotal);
  }, [selections]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "Successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out.",
        variant: "destructive",
      });
    }
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
          <div className="flex flex-col items-center">
            <img 
              src="https://i.ibb.co/z84hqSg/Logo-Pluria-Gold.png" 
              alt="Pluria Logo"
              className="w-1/4 mb-2 md:mb-8"
            />
            <h1 className="mb-9">Custom Builder</h1>
            {auth.currentUser && (
              <div className="mb-6 text-sm text-center">
                <p className="mb-2">{auth.currentUser.displayName}</p>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
          <CustomizerForm 
            onSelectionChange={setSelections}
            onClose={() => setIsMenuOpen(false)}
            isMobile={isMobile}
          />
        </div>
      </CSSTransition>

      {/* Right Column */}
      <div className="flex-1 bg-background min-h-screen relative">
        <div className="absolute top-4 right-4 text-sm z-[9999]">
          Total: R${total}
        </div>
        <div className="h-full flex items-center justify-center p-8">
          <div className="relative w-full h-full max-w-2xl max-h-2xl">
            {selections.Body?.image && (
              <img
                src={selections.Body.image}
                alt="Body"
                className="absolute inset-0 w-full h-full object-contain z-0"
              />
            )}
            {selections.Top?.image && (
              <img
                src={selections.Top.image}
                alt="Top"
                className="absolute inset-0 w-full h-full object-contain z-1"
              />
            )}
            {selections.Pickup?.image && (
              <img
                src={selections.Pickup.image}
                alt="Pickup"
                className="absolute inset-0 w-full h-full object-contain z-2"
              />
            )}
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal && !auth.currentUser} 
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default Index;