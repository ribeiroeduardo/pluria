import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import React from "react";
import { Menu } from "@/components/Menu";
import { GuitarPreview } from "@/components/GuitarPreview";

// Types
interface Option {
  id: number;
  option: string;
  price_usd: number | null;
  active: boolean;
  is_default: boolean;
  id_related_subcategory: number;
  strings: string;
  scale_length?: string;
  zindex: number;
  image_url: string | null;
  color_hardware: string | null;
  view: string | null;
}

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

  // Convert selectedOptions array to Record<string, Option>
  const selectionsRecord = selectedOptions.reduce((acc, option) => {
    acc[option.id_related_subcategory.toString()] = option;
    return acc;
  }, {} as Record<string, Option>);

  // Calculate total
  const total = selectedOptions.reduce((sum, option) => sum + (option.price_usd || 0), 0);

  return (
    <div className="grid grid-cols-[300px_1fr] gap-4">
      <Menu 
        onOptionSelect={handleOptionSelect}
        onInitialData={handleInitialData}
      />
      <div className="relative">
        <GuitarPreview selections={selectionsRecord} total={total} />
      </div>
    </div>
  );
}
