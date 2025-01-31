import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  isMobile: boolean;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export const Header = ({ isMobile, isMenuOpen, onMenuToggle }: HeaderProps) => {
  const { toast } = useToast();

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
  );
};