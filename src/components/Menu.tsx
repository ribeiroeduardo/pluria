import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import React from "react";

interface Option {
  id: number;
  option: string;
  price_usd: number | null;
  active: boolean;
  is_default: boolean;
  id_related_subcategory?: number;
  strings?: string;
  image_url?: string | null;
  scale_length?: string;
  zindex?: number;
}

interface Subcategory {
  id: number;
  subcategory: string;
  sort_order: number;
  options: Option[];
  hidden: boolean;
  id_related_category: number;
}

interface Category {
  id: number;
  category: string;
  sort_order: number;
  subcategories: Subcategory[];
}

interface MenuProps {
  onOptionSelect: (option: Option) => void;
  onInitialData: (options: Option[]) => void;
}

export function Menu({ onOptionSelect, onInitialData }: MenuProps) {
  const [userSelections, setUserSelections] = React.useState<Record<number, number>>({});
  const [selectedOptionId, setSelectedOptionId] = React.useState<number | null>(null);
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const [linkedSelections, setLinkedSelections] = React.useState<Record<number, number>>({});

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", selectedOptionId],
    queryFn: async () => {
      const categoriesData = await fetchCategories();
      const subcategoriesData = await fetchSubcategories();
      const optionsData = await fetchOptions(selectedOptionId);

      handleInitialData(optionsData);

      return buildCategoryStructure(categoriesData, subcategoriesData, optionsData);
    },
  });

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    
    if (error) throw error;
    return data;
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase
      .from("subcategories")
      .select("*")
      .not('id', 'in', '(5,34,35)')
      .eq('hidden', false)
      .order("sort_order");
    
    if (error) throw error;
    return data;
  };

  const fetchOptions = async (selectedId: number | null) => {
    let query = supabase
      .from("options")
      .select("*")
      .eq("active", true);

    query = applyStringFilters(query, selectedId);
    query = applyScaleFilter(query, selectedId);
    query = query.order('zindex', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    return data.map(processOptionImageUrl);
  };

  const applyStringFilters = (query: any, selectedId: number | null) => {
    const stringFilters: Record<number, string> = {
      369: 'strings.eq.6,strings.eq.all,strings.is.null',
      370: 'strings.eq.7,strings.eq.all,strings.is.null',
      371: 'strings.eq.8,strings.eq.all,strings.is.null'
    };

    if (selectedId && stringFilters[selectedId]) {
      return query.or(stringFilters[selectedId]);
    }
    return query;
  };

  const applyScaleFilter = (query: any, selectedId: number | null) => {
    if (selectedId === 372) {
      return query.eq('scale_length', 'Multiscale');
    }
    return query;
  };

  const processOptionImageUrl = (option: Option) => ({
    ...option,
    image_url: option.image_url ? `/images/${option.image_url.split('/').pop()}` : null
  });

  const handleInitialData = (optionsData: Option[]) => {
    if (!hasInitialized) {
      const defaultStringOption = optionsData.find(opt => opt.is_default && opt.strings);
      if (defaultStringOption?.id) {
        setSelectedOptionId(defaultStringOption.id);
        initializeDefaultSelections(optionsData);
      }
    }
  };

  const initializeDefaultSelections = (optionsData: Option[]) => {
    const defaultSelections: Record<number, number> = {};
    optionsData.forEach(option => {
      if (option.is_default && option.id_related_subcategory) {
        if (option.id === 25) {
          defaultSelections[option.id_related_subcategory] = 992;
          setLinkedSelections(prev => ({ ...prev, 25: 992 }));
        } else {
          defaultSelections[option.id_related_subcategory] = option.id;
        }
      }
    });
    setUserSelections(defaultSelections);
    setHasInitialized(true);
    onInitialData(optionsData);
  };

  const buildCategoryStructure = (
    categoriesData: any[],
    subcategoriesData: any[],
    optionsData: Option[]
  ) => {
    return categoriesData
      .filter(category => category.category !== "Other")
      .map(category => ({
        ...category,
        subcategories: subcategoriesData
          .filter(sub => sub.id_related_category === category.id)
          .map(subcategory => ({
            ...subcategory,
            options: optionsData
              .filter(opt => opt.id_related_subcategory === subcategory.id)
              .sort((a, b) => (a.price_usd || 0) - (b.price_usd || 0) || (a.zindex || 0) - (b.zindex || 0))
          }))
      }));
  };

  const handleOptionSelect = (subcategoryId: number, value: string) => {
    const option = findOptionById(subcategoryId, value);
    if (option) {
      updateSelections(subcategoryId, option);
      setSelectedOptionId(option.id);
      onOptionSelect(option);
    }
  };

  const findOptionById = (subcategoryId: number, value: string) => {
    return categories
      ?.flatMap(cat => cat.subcategories)
      .find(sub => sub.id === subcategoryId)
      ?.options.find(opt => opt.id.toString() === value);
  };

  const updateSelections = (subcategoryId: number, option: Option) => {
    if (option.id === 25) {
      setUserSelections(prev => ({
        ...prev,
        [subcategoryId]: option.id,
        [992]: 992
      }));
      setLinkedSelections(prev => ({ ...prev, 25: 992 }));
    } else {
      setUserSelections(prev => ({
        ...prev,
        [subcategoryId]: option.id
      }));
    }
  };

  if (isLoading) {
    return <div>Loading menu...</div>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {categories?.map((category) => (
        <AccordionItem key={category.id} value={category.id.toString()}>
          <AccordionTrigger>{category.category}</AccordionTrigger>
          <AccordionContent>
            {category.subcategories.map((subcategory) => (
              <div key={subcategory.id} className="mb-4">
                <h3 className="mb-2 font-semibold">{subcategory.subcategory}</h3>
                <RadioGroup
                  value={userSelections[subcategory.id]?.toString()}
                  onValueChange={(value) => handleOptionSelect(subcategory.id, value)}
                  className="flex flex-col gap-1.5 pl-4"
                >
                  {subcategory.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                      <Label htmlFor={option.id.toString()}>
                        {option.option}
                        {option.price_usd ? ` (+$${option.price_usd.toLocaleString('en-US', {
                          minimumFractionDigits: option.price_usd >= 1000 ? 2 : 0,
                          maximumFractionDigits: option.price_usd >= 1000 ? 2 : 0
                        })})` : ''}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
