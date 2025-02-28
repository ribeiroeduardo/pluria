
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
  console.log('Processing image layers from selected options:', selectedOptions);
  console.log('Current view:', currentView);
  
  const layers: ImageLayer[] = []
  const selectedOptionsArray = Array.from(selectedOptions.values())

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
    if (!imageUrl) return;

    // Check if this option should be hidden based on other selected options
    const shouldHide = selectedOptionsArray.some(selectedOption => 
      shouldHideOption(option, selectedOptions)
    );

    if (shouldHide) return;
    
    console.log('Processing layer for option:', { 
      id: option.id, 
      name: option.option, 
      imageUrl,
      viewType
    });

    layers.push({
      url: imageUrl,
      zIndex: option.zindex || 1,
      optionId: option.id,
      view: viewType,
      isVisible: true
    });
  });

  // Sort layers by z-index
  const sortedLayers = layers.sort((a, b) => a.zIndex - b.zIndex);
  console.log('Final processed layers for view', currentView, ':', sortedLayers);
  
  return sortedLayers;
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
