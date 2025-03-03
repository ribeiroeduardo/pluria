import type {
  Option,
  GuitarConfiguration,
  ConfigurationError,
  OptionValidation,
  OptionDependency,
  ImageLayer,
  HardwareColor,
  StringCount,
  ScaleLength,
  GuitarView
} from '@/types/guitar'
import { getImagePath } from '@/lib/imageMapping'
import { shouldHideOption } from '@/utils/filterRules'

// Hardware color compatibility mapping
export const HARDWARE_COLORS: Record<string, HardwareColor> = {
  BLACK: 'Preto',
  CHROME: 'Cromado'
}

// Option dependencies and constraints
export const OPTION_DEPENDENCIES: Record<number, OptionDependency[]> = {
  // Example: When Buckeye Burl (id: 55) is selected, it requires specific finish options
  55: [
    {
      subcategoryId: 39,
      requiredOptionIds: [1032], // Natural finish
      incompatibleOptionIds: []
    }
  ]
}

// Validate individual option selection
export function validateOptionSelection(
  option: Option,
  currentConfig: GuitarConfiguration
): OptionValidation {
  // Check hardware color compatibility
  if (option.color_hardware) {
    const hasIncompatibleHardware = Array.from(currentConfig.selectedOptions.values()).some(
      selected => 
        selected.color_hardware && 
        selected.color_hardware !== option.color_hardware
    )
    if (hasIncompatibleHardware) {
      return {
        isValid: false,
        error: {
          type: 'incompatible_options',
          message: `This option is not compatible with your current hardware color selection`,
          optionId: option.id
        }
      }
    }
  }

  // Check string count compatibility
  if (option.strings) {
    const hasIncompatibleStrings = Array.from(currentConfig.selectedOptions.values()).some(
      selected => 
        selected.strings && 
        selected.strings !== option.strings
    )
    if (hasIncompatibleStrings) {
      return {
        isValid: false,
        error: {
          type: 'incompatible_options',
          message: `This option is not compatible with your current string configuration`,
          optionId: option.id
        }
      }
    }
  }

  // Check scale length compatibility
  if (option.scale_length) {
    const hasIncompatibleScale = Array.from(currentConfig.selectedOptions.values()).some(
      selected => 
        selected.scale_length && 
        selected.scale_length !== option.scale_length
    )
    if (hasIncompatibleScale) {
      return {
        isValid: false,
        error: {
          type: 'incompatible_options',
          message: `This option is not compatible with your current scale length configuration`,
          optionId: option.id
        }
      }
    }
  }

  // Check dependencies
  const dependencies = OPTION_DEPENDENCIES[option.id]
  if (dependencies) {
    for (const dep of dependencies) {
      const subcategoryOption = Array.from(currentConfig.selectedOptions.entries())
        .find(([subcatId]) => subcatId === dep.subcategoryId)

      // Check required options
      if (dep.requiredOptionIds.length > 0 && 
          (!subcategoryOption || !dep.requiredOptionIds.includes(subcategoryOption[1].id))) {
        return {
          isValid: false,
          error: {
            type: 'missing_required',
            message: `This option requires specific selections in other categories`,
            optionId: option.id,
            subcategoryId: dep.subcategoryId
          }
        }
      }

      // Check incompatible options
      if (subcategoryOption && dep.incompatibleOptionIds.includes(subcategoryOption[1].id)) {
        return {
          isValid: false,
          error: {
            type: 'incompatible_options',
            message: `This option is not compatible with your current selections`,
            optionId: option.id,
            subcategoryId: dep.subcategoryId
          }
        }
      }
    }
  }

  return { isValid: true }
}

// Calculate total price
export function calculateTotalPrice(selectedOptions: Map<number, Option>): number {
  return Array.from(selectedOptions.values())
    .reduce((total, option) => total + (option.price_usd || 0), 0)
}

// Process and organize image layers
export function processImageLayers(
  selectedOptions: Map<number, Option>,
  currentView: GuitarView = 'front'
): ImageLayer[] {
  console.log(`[DEBUG-LAYERS] Processing image layers for ${currentView} view with ${selectedOptions.size} selected options`);
  
  const layers: ImageLayer[] = []
  const selectedOptionsArray = Array.from(selectedOptions.values())

  // IDs that need z-index 0 in back view (neck wood pieces that should be behind)
  const backViewNeckIds = new Set([83, 1151, 989, 86, 982]);

  // IDs that need z-index 99 in back view (bolt-on components)
  const backViewBoltIds = new Set([729, 1152]);

  // Track which layers have valid URLs to ensure we don't show empty components
  let validLayerCount = 0;

  selectedOptionsArray.forEach(option => {
    // Determine which image URL to use based on the current view
    let imageUrl = null;
    let viewType: GuitarView | null = null;
    
    if (currentView === 'front' && option.front_image_url) {
      imageUrl = `/images/${option.front_image_url.split('/').pop()}`;
      viewType = 'front';
    } else if (currentView === 'back' && option.back_image_url) {
      imageUrl = `/images/${option.back_image_url.split('/').pop()}`;
      viewType = 'back';
    }
    
    // Skip if no appropriate image for the current view
    if (!imageUrl) {
      console.log(`[DEBUG-LAYERS] Skipping option ${option.id} (${option.option}) - no image for ${currentView} view`);
      return;
    }

    // Check if this option should be hidden based on other selected options
    const shouldHide = selectedOptionsArray.some(selectedOption => 
      shouldHideOption(option, selectedOptions)
    );

    if (shouldHide) {
      console.log(`[DEBUG-LAYERS] Hiding option ${option.id} (${option.option}) - should be hidden based on other selections`);
      return;
    }
    
    // Increment valid layer count
    validLayerCount++;
    
    console.log(`[DEBUG-LAYERS] Adding layer for option ${option.id} (${option.option}) with image ${imageUrl}`);

    // Determine z-index based on component type and view
    let zIndex = option.zindex || 1;
    
    // Identify component types
    const isBodyWood = option.id_related_subcategory === 1; // Body wood subcategory
    const isNeckWood = option.id_related_subcategory === 2;
    
    // For back view, handle z-index assignments
    if (currentView === 'back') {
      if (backViewBoltIds.has(option.id)) {
        zIndex = 9999; // Place bolt-on components on top
      } else if (backViewNeckIds.has(option.id) || isNeckWood) {
        zIndex = 0; // Place neck wood behind everything
      } else if (isBodyWood) {
        zIndex = 2; // Place body above neck in back view
      } else {
        zIndex = 1; // Other components in between
      }
    }

    layers.push({
      url: imageUrl,
      zIndex: zIndex,
      optionId: option.id,
      view: viewType,
      isVisible: true
    });
  });

  // Sort layers by z-index
  layers.sort((a, b) => a.zIndex - b.zIndex)
  
  console.log(`[DEBUG-LAYERS] Finished processing ${layers.length} layers for ${currentView} view (${validLayerCount} valid options)`);
  
  // Log the first few layers for debugging
  if (layers.length > 0) {
    console.log(`[DEBUG-LAYERS] First 3 layers:`, layers.slice(0, 3).map(l => ({
      optionId: l.optionId,
      url: l.url ? l.url.split('/').pop() : 'none',
      zIndex: l.zIndex
    })));
    
    if (layers.length > 3) {
      console.log(`[DEBUG-LAYERS] Last 3 layers:`, layers.slice(-3).map(l => ({
        optionId: l.optionId,
        url: l.url ? l.url.split('/').pop() : 'none',
        zIndex: l.zIndex
      })));
    }
  } else {
    console.log(`[DEBUG-LAYERS] Warning: No layers generated for ${currentView} view!`);
  }

  return layers
}

// Validate entire configuration
export function validateConfiguration(config: GuitarConfiguration): ConfigurationError[] {
  const errors: ConfigurationError[] = []

  // Check for required categories
  const requiredSubcategories = [1, 2, 3] // Example: body, neck, bridge
  for (const subcatId of requiredSubcategories) {
    if (!config.selectedOptions.has(subcatId)) {
      errors.push({
        type: 'missing_required',
        message: `Missing required selection for category ${subcatId}`,
        subcategoryId: subcatId
      })
    }
  }

  // Validate each selected option
  config.selectedOptions.forEach((option, subcatId) => {
    const validation = validateOptionSelection(option, config)
    if (!validation.isValid && validation.error) {
      errors.push(validation.error)
    }
  })

  return errors
}

// Check if options are compatible
export function areOptionsCompatible(option1: Option, option2: Option): boolean {
  // Check hardware color compatibility
  if (option1.color_hardware && option2.color_hardware && 
      option1.color_hardware !== option2.color_hardware) {
    return false
  }

  // Check string count compatibility
  if (option1.strings && option2.strings && 
      option1.strings !== option2.strings) {
    return false
  }

  // Check scale length compatibility
  if (option1.scale_length && option2.scale_length && 
      option1.scale_length !== option2.scale_length) {
    return false
  }

  return true
}
