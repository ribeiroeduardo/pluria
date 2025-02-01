interface HeaderProps {
  isMobile: boolean;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export const Header = ({ isMobile, isMenuOpen, onMenuToggle }: HeaderProps) => {
  return (
    <div className="flex flex-col items-center">
      <img 
        src="https://i.ibb.co/z84hqSg/Logo-Pluria-Gold.png" 
        alt="Pluria Logo"
        className="w-1/4 mb-2 md:mb-8"
      />
      <h1 className="mb-9">Custom Builder v1</h1>
    </div>
  );
};