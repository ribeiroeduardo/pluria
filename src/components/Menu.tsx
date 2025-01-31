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

interface Category {
  id: number;
  category: string;
  sort_order: number;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: number;
  subcategory: string;
  sort_order: number;
  options: Option[];
}

interface Option {
  id: number;
  option: string;
  price_usd: number | null;
  active: boolean;
  is_default: boolean;
}

export function Menu({ onOptionSelect }: { onOptionSelect: (option: Option) => void }) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories...");
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw categoriesError;
      }

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from("subcategories")
        .select("*")
        .order("sort_order");

      if (subcategoriesError) {
        console.error("Error fetching subcategories:", subcategoriesError);
        throw subcategoriesError;
      }

      // Fetch options
      const { data: optionsData, error: optionsError } = await supabase
        .from("options")
        .select("*")
        .eq("active", true);

      if (optionsError) {
        console.error("Error fetching options:", optionsError);
        throw optionsError;
      }

      // Build the nested structure
      const categoriesWithChildren = categoriesData.map((category) => ({
        ...category,
        subcategories: subcategoriesData
          .filter((sub) => sub.id_related_category === category.id)
          .map((subcategory) => ({
            ...subcategory,
            options: optionsData.filter(
              (opt) => opt.id_related_subcategory === subcategory.id
            ),
          })),
      }));

      console.log("Fetched data:", categoriesWithChildren);
      return categoriesWithChildren;
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading menu...</div>;
  }

  return (
    <div className="w-full max-w-md">
      <Accordion type="single" collapsible className="w-full">
        {categories?.map((category) => (
          <AccordionItem key={category.id} value={`category-${category.id}`}>
            <AccordionTrigger className="text-lg font-semibold">
              {category.category}
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="single" collapsible className="w-full">
                {category.subcategories.map((subcategory) => (
                  <AccordionItem
                    key={subcategory.id}
                    value={`subcategory-${subcategory.id}`}
                  >
                    <AccordionTrigger className="text-base pl-2">
                      {subcategory.subcategory}
                    </AccordionTrigger>
                    <AccordionContent>
                      <RadioGroup
                        onValueChange={(value) => {
                          const option = subcategory.options.find(
                            (opt) => opt.id.toString() === value
                          );
                          if (option) {
                            onOptionSelect(option);
                          }
                        }}
                        className="flex flex-col gap-2 pl-4"
                      >
                        {subcategory.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={option.id.toString()}
                              id={`option-${option.id}`}
                            />
                            <Label htmlFor={`option-${option.id}`} className="flex-1">
                              {option.option}
                              {option.price_usd && option.price_usd > 0 && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                  (+${option.price_usd})
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}