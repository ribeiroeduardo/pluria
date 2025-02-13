import type { Option } from '@/types/guitar';

// Hardware color option IDs
export const HARDWARE_COLOR = {
  BLACK: 727,
  CHROME: 728,
} as const;

// Type for hardware color values
export type HardwareColor = typeof HARDWARE_COLOR[keyof typeof HARDWARE_COLOR];

// Type guard for hardware color
export const isHardwareColor = (value: number): value is HardwareColor => {
  return value === HARDWARE_COLOR.BLACK || value === HARDWARE_COLOR.CHROME;
};

// String configuration option IDs
export const STRINGS = {
  SIX: 369,
  SEVEN: 370,
} as const;

// Hardware components and their color variants
export const HARDWARE_COMPONENTS = {
  TUNERS_6: { BLACK: 102, CHROME: 997 },
  TUNERS_7: { BLACK: 104, CHROME: null }, // Chrome variant TBD
  KNOB_VOLUME: { BLACK: 731, CHROME: 999 },
  KNOB_VOLUME_TONE: { BLACK: 1011, CHROME: 1012 },
  HIPSHOT_FIXED_6: { BLACK: 112, CHROME: 996 },
  SPOKEWHEEL: { BLACK: 1030, CHROME: 1031 },
} as const;

export const PAIRED_OPTIONS: Record<number, number> = {
  // Volume + Tone pairs
  [HARDWARE_COMPONENTS.KNOB_VOLUME_TONE.CHROME]: HARDWARE_COMPONENTS.KNOB_VOLUME_TONE.BLACK,
  [HARDWARE_COMPONENTS.KNOB_VOLUME_TONE.BLACK]: HARDWARE_COMPONENTS.KNOB_VOLUME_TONE.CHROME,
  // Volume Knob pairs
  [HARDWARE_COMPONENTS.KNOB_VOLUME.BLACK]: HARDWARE_COMPONENTS.KNOB_VOLUME.CHROME,
  [HARDWARE_COMPONENTS.KNOB_VOLUME.CHROME]: HARDWARE_COMPONENTS.KNOB_VOLUME.BLACK,
  // Hipshot Fixed Bridge pairs
  [HARDWARE_COMPONENTS.HIPSHOT_FIXED_6.BLACK]: HARDWARE_COMPONENTS.HIPSHOT_FIXED_6.CHROME,
  [HARDWARE_COMPONENTS.HIPSHOT_FIXED_6.CHROME]: HARDWARE_COMPONENTS.HIPSHOT_FIXED_6.BLACK,
  // Tuners pairs
  [HARDWARE_COMPONENTS.TUNERS_6.BLACK]: HARDWARE_COMPONENTS.TUNERS_6.CHROME,
  [HARDWARE_COMPONENTS.TUNERS_6.CHROME]: HARDWARE_COMPONENTS.TUNERS_6.BLACK,
  // Spokewheel pairs
  [HARDWARE_COMPONENTS.SPOKEWHEEL.BLACK]: HARDWARE_COMPONENTS.SPOKEWHEEL.CHROME,
  [HARDWARE_COMPONENTS.SPOKEWHEEL.CHROME]: HARDWARE_COMPONENTS.SPOKEWHEEL.BLACK,
};

// Helper function to check if an option ID is a knob option
export const isKnobOption = (optionId: number): boolean => {
  const knobIds = Object.values(HARDWARE_COMPONENTS)
    .flatMap(component => Object.values(component))
    .filter((id): id is number => id !== null);
  return knobIds.includes(optionId);
};

// Helper function to get all hardware component IDs for a specific color and string count
export const getHardwareComponentIds = (
  color: HardwareColor, 
  stringCount: '6' | '7',
  currentSelections: Record<number, number>
): number[] => {
  console.log('getHardwareComponentIds called with:', { color, stringCount, currentSelections });
  
  const components = [];
  const selectedOptionIds = Object.values(currentSelections);

  // Always add Spokewheel based on color (regardless of string count)
  if (color === HARDWARE_COLOR.BLACK) {
    components.push(HARDWARE_COMPONENTS.SPOKEWHEEL.BLACK);
    console.log('Added Black Spokewheel:', HARDWARE_COMPONENTS.SPOKEWHEEL.BLACK);
  } else {
    components.push(HARDWARE_COMPONENTS.SPOKEWHEEL.CHROME);
    console.log('Added Chrome Spokewheel:', HARDWARE_COMPONENTS.SPOKEWHEEL.CHROME);
  }

  // Add tuners based on string count
  if (stringCount === '6') {
    components.push(
      color === HARDWARE_COLOR.BLACK ? HARDWARE_COMPONENTS.TUNERS_6.BLACK : HARDWARE_COMPONENTS.TUNERS_6.CHROME
    );
  } else if (stringCount === '7' && color === HARDWARE_COLOR.BLACK) {
    components.push(HARDWARE_COMPONENTS.TUNERS_7.BLACK);
  }

  // Add bridge
  if (stringCount === '6') {
    components.push(
      color === HARDWARE_COLOR.BLACK ? HARDWARE_COMPONENTS.HIPSHOT_FIXED_6.BLACK : HARDWARE_COMPONENTS.HIPSHOT_FIXED_6.CHROME
    );
  }

  // Determine which knob type is currently selected
  const hasVolumeKnob = selectedOptionIds.some(id => 
    id === HARDWARE_COMPONENTS.KNOB_VOLUME.BLACK || 
    id === HARDWARE_COMPONENTS.KNOB_VOLUME.CHROME
  );
  const hasVolumeToneKnob = selectedOptionIds.some(id => 
    id === HARDWARE_COMPONENTS.KNOB_VOLUME_TONE.BLACK || 
    id === HARDWARE_COMPONENTS.KNOB_VOLUME_TONE.CHROME
  );

  // If no knob is selected yet, default to Volume+Tone
  if (!hasVolumeKnob && !hasVolumeToneKnob) {
    components.push(
      color === HARDWARE_COLOR.BLACK ? HARDWARE_COMPONENTS.KNOB_VOLUME_TONE.BLACK : HARDWARE_COMPONENTS.KNOB_VOLUME_TONE.CHROME
    );
  } else {
    // Keep the current knob type but update its color
    if (hasVolumeKnob) {
      components.push(
        color === HARDWARE_COLOR.BLACK ? HARDWARE_COMPONENTS.KNOB_VOLUME.BLACK : HARDWARE_COMPONENTS.KNOB_VOLUME.CHROME
      );
    } else {
      components.push(
        color === HARDWARE_COLOR.BLACK ? HARDWARE_COMPONENTS.KNOB_VOLUME_TONE.BLACK : HARDWARE_COMPONENTS.KNOB_VOLUME_TONE.CHROME
      );
    }
  }

  const result = components.filter((id): id is number => id !== null);
  console.log('Final hardware components:', result);
  return result;
};

export const getSubcategoryIdForOption = (optionId: number, categories: Category[]) => {
  const allOptions = categories?.flatMap(cat => 
    cat.subcategories.flatMap(sub => sub.options)
  ) || [];
  return allOptions.find(opt => opt.id === optionId)?.id_related_subcategory;
};

export const handlePairedSelections = (
  currentSelections: Record<number, number>,
  categories: Category[]
) => {
  let newSelections = { ...currentSelections };
  
  Object.entries(currentSelections).forEach(([subcategoryId, optionId]) => {
    const pairedOptionId = PAIRED_OPTIONS[optionId];
    if (pairedOptionId) {
      const pairedSubcategoryId = getSubcategoryIdForOption(pairedOptionId, categories);
      if (pairedSubcategoryId) {
        newSelections[pairedSubcategoryId] = pairedOptionId;
      }
    }
  });

  return newSelections;
};

export const findSelectedOptionBySubcategory = (
  subcategoryId: number,
  options: Option[],
  userSelections: Record<number, number>
) => {
  const selectedId = userSelections[subcategoryId];
  return options.find(opt => opt.id === selectedId);
};

export const findAnySelectedOptionByValue = (
  optionValue: string,
  allOptions: Option[],
  userSelections: Record<number, number>
) => {
  const selectedIds = Object.values(userSelections);
  return allOptions.find(opt => selectedIds.includes(opt.id) && opt.option === optionValue);
};

export interface Category {
  id: number;
  category: string;
  sort_order: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  subcategory: string;
  sort_order: number;
  options: Option[];
  hidden: boolean;
  id_related_category: number;
}

// Helper function to get paired hardware components when color changes
export const getPairedHardwareSelections = (
  currentSelections: Map<number, Option>,
  newHardwareColor: 'Preto' | 'Cromado',
  availableOptions: Option[]
): Map<number, Option> => {
  const newSelections = new Map(currentSelections);
  
  // Convert selected options to array for easier processing
  const selectedOptions = Array.from(currentSelections.values());
  
  // Find all hardware components that need to be paired
  selectedOptions.forEach(option => {
    // Find if this option has a paired variant
    const pairedOptionId = PAIRED_OPTIONS[option.id];
    if (!pairedOptionId) return;

    // Get the current option's hardware color
    const currentColor = option.color_hardware;
    if (!currentColor) return;

    // If the current color doesn't match the new color, we need to switch to the paired option
    if (currentColor !== newHardwareColor) {
      // Find the subcategory ID for the current option
      const subcategoryId = Array.from(currentSelections.entries())
        .find(([_, opt]) => opt.id === option.id)?.[0];
      
      if (subcategoryId) {
        // Find the paired option in the available options array
        const pairedOption = availableOptions.find(opt => opt.id === pairedOptionId);
        if (pairedOption) {
          newSelections.set(subcategoryId, pairedOption);
        }
      }
    }
  });

  return newSelections;
};
