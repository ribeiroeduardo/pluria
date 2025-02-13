import type { Option } from '@/types/guitar'

interface FilterRule {
  type: 'strings' | 'scale_length' | 'color_hardware' | 'wood_color'
  hideWhen: string | number[] | number
  showOnlyWith?: number // The ID of the wood option that should show this color option
}

export const FILTER_RULES: Record<number, FilterRule> = {
  369: { // 6 Strings
    type: 'strings',
    hideWhen: '7'
  },
  242: { // 25.5 Scale
    type: 'scale_length',
    hideWhen: 'multiscale'
  },
  243: { // 25.5-27 Scale
    type: 'scale_length',
    hideWhen: 'standard'
  },
  727: { // Black Hardware
    type: 'color_hardware',
    hideWhen: 'Cromado'
  },
  728: { // Chrome Hardware
    type: 'color_hardware',
    hideWhen: 'Preto'
  },
  // Top Wood rules - subcategory 21 (Top Wood)
  // Each wood type should hide other wood's color options
  // Buckeye Burl (Natural, Blue, Purple, Yellow, Red)
  1032: { // Natural Buckeye Burl
    type: 'wood_color',
    hideWhen: [40, 41, 44] // Hide Flamed Maple, Maple Burl, and Quilted Maple color options
  },
  1033: { // Blue Buckeye Burl
    type: 'wood_color',
    hideWhen: [40, 41, 44]
  },
  1034: { // Purple Buckeye Burl
    type: 'wood_color',
    hideWhen: [40, 41, 44]
  },
  1035: { // Yellow Buckeye Burl
    type: 'wood_color',
    hideWhen: [40, 41, 44]
  },
  1036: { // Red Buckeye Burl
    type: 'wood_color',
    hideWhen: [40, 41, 44]
  },
  // Flamed Maple
  1037: {
    type: 'wood_color',
    hideWhen: [39, 41, 44] // Hide Buckeye Burl, Maple Burl, and Quilted Maple color options
  },
  // Maple Burl
  1038: {
    type: 'wood_color',
    hideWhen: [39, 40, 44] // Hide Buckeye Burl, Flamed Maple, and Quilted Maple color options
  },
  // Quilted Maple
  1039: {
    type: 'wood_color',
    hideWhen: [39, 40, 41] // Hide Buckeye Burl, Flamed Maple, and Maple Burl color options
  }
}

// Map of color subcategory IDs to their corresponding wood option IDs
const COLOR_TO_WOOD_MAP: Record<number, number> = {
  39: 55, // Buckeye Burl colors require Buckeye Burl wood
  40: 56, // Flamed Maple colors require Flamed Maple wood
  41: 57, // Maple Burl colors require Maple Burl wood
  44: 58  // Quilted Maple colors require Quilted Maple wood
}

export function shouldHideOption(option: Option, selectedOptions: Map<number, Option>): boolean {
  // First check standard rules
  for (const [, selectedOption] of selectedOptions) {
    const rule = FILTER_RULES[selectedOption.id]
    if (!rule) continue

    switch (rule.type) {
      case 'strings':
        if (option.strings === rule.hideWhen) return true
        break
      case 'scale_length':
        if (option.scale_length === rule.hideWhen) return true
        break
      case 'color_hardware':
        if (option.color_hardware === rule.hideWhen) return true
        break
    }
  }

  // Special handling for wood colors
  const colorSubcategoryId = option.id_related_subcategory
  if (colorSubcategoryId && COLOR_TO_WOOD_MAP[colorSubcategoryId]) {
    // This is a color option, check if its corresponding wood is selected
    const requiredWoodId = COLOR_TO_WOOD_MAP[colorSubcategoryId]
    const hasMatchingWood = Array.from(selectedOptions.values()).some(
      opt => opt.id === requiredWoodId
    )
    // Hide the color option if its wood is not selected
    return !hasMatchingWood
  }

  return false
} 
