import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Option {
  label: string;
  price: number;
  image?: string;
}

interface FormSection {
  title: string;
  options: Option[];
}

const formSections: FormSection[] = [
  {
    title: 'Body',
    options: [
      { label: 'Paulownia', price: 100, image: 'https://i.ibb.co/gvzBhFv/corpo-omni-paulownia.png' }
    ]
  },
  {
    title: 'Top',
    options: [
      { label: 'None', price: 0 },
      { label: 'Blue', price: 50, image: 'https://i.ibb.co/N2ykDps/tampo-omni-buckeye-burl-azul.png' },
      { label: 'Red', price: 50, image: 'https://i.ibb.co/4VKmF4J/tampo-omni-buckeye-burl-vermelho.png' }
    ]
  },
  {
    title: 'Pickup',
    options: [
      { label: 'White', price: 102, image: 'https://i.ibb.co/fvTbxhm/captador-humbucker-brac-o-branco.png' },
      { label: 'Black', price: 102, image: 'https://i.ibb.co/fNWgC9j/captador-humbucker-brac-o-preto.png' }
    ]
  }
];

interface CustomizerFormProps {
  onSelectionChange: (selections: Record<string, Option>) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export const CustomizerForm = ({ onSelectionChange, onClose, isMobile }: CustomizerFormProps) => {
  const [selections, setSelections] = useState<Record<string, Option>>({
    Body: formSections[0].options[0],
    Top: formSections[1].options[0],
    Pickup: formSections[2].options[1]
  });

  const handleSelectionChange = (section: string, option: Option) => {
    const newSelections = { ...selections, [section]: option };
    setSelections(newSelections);
    onSelectionChange(newSelections);
    if (isMobile) {
      onClose?.();
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {formSections.map((section) => (
        <AccordionItem key={section.title} value={section.title} className="mb-4 bg-muted/50 rounded-lg">
          <AccordionTrigger className="px-4">{section.title}</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <RadioGroup
              value={selections[section.title]?.label}
              onValueChange={(value) => {
                const option = section.options.find(opt => opt.label === value);
                if (option) {
                  handleSelectionChange(section.title, option);
                }
              }}
            >
              {section.options.map((option) => (
                <div key={option.label} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value={option.label} id={`${section.title}-${option.label}`} />
                  <Label htmlFor={`${section.title}-${option.label}`} className="flex-1 cursor-pointer">
                    {option.label} (R${option.price})
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};