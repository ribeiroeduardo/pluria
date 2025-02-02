import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

function ProductConfigurator() {
  const [selectedOptions, setSelectedOptions] = React.useState<Option[]>([]);
  
  const handleOptionSelect = (option: Option) => {
    setSelectedOptions(prev => {
      const filtered = prev.filter(opt => opt.id_related_subcategory !== option.id_related_subcategory);
      return [...filtered, option];
    });
  };

  const handleInitialData = (options: Option[]) => {
    const defaultOptions = options.filter(opt => opt.is_default);
    setSelectedOptions(defaultOptions);
  };

  return (
    <div className="grid grid-cols-[300px_1fr]">
      <Menu 
        onOptionSelect={handleOptionSelect}
        onInitialData={handleInitialData}
      />
      <ProductPreview selectedOptions={selectedOptions} />
      <Total selectedOptions={selectedOptions} />
    </div>
  );
}
