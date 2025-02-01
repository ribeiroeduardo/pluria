interface HeaderProps {
  isMobile: boolean;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export const Header = ({ isMobile, isMenuOpen, onMenuToggle }: HeaderProps) => {
  return (
    <div className="flex items-center justify-start">
      <img 
        src="/images/logo-pluria-white.svg" 
        alt="Pluria Logo"
        className="w-1/3 mb-2 md:mb-8"
      />
    </div>
  );
};