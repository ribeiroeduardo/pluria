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

interface TotalProps {
  selectedOptions: Option[];
}

function Total({ selectedOptions }: TotalProps) {
  const total = selectedOptions.reduce((sum, option) => sum + (option.price_usd || 0), 0);
  
  return (
    <div>
      <h3>Total: ${total.toFixed(2)}</h3>
    </div>
  );
}

const formSections: FormSection[] = [
  {
    title: 'Body',
    options: [
      { label: 'Paulownia', price: 100, image: '/images/omni-corpo-paulownia.png' }
    ]
  },
  {
    title: 'Top',
    options: [
      { label: 'None', price: 0 },
      { label: 'Blue', price: 50, image: '/images/omni-tampo-buckeye-burl-azul.png' },
      { label: 'Red', price: 50, image: '/images/omni-tampo-buckeye-burl-vermelho.png' }
    ]
  },
  {
    title: 'Pickup',
    options: [
      { label: 'White', price: 102, image: '/images/captador-humbucker-branco.png' },
      { label: 'Black', price: 102, image: '/images/captador-humbucker-preto.png' }
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