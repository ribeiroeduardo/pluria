import type { Option, Subcategory } from '@/types/guitar'

interface FilterRule {
  type: 'strings' | 'scale_length' | 'color_hardware' | 'option_55_filter'
  hideWhen: string | number[]
  showOnly?: {
    subcategories?: number[]
    options?: number[]
  }
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
  55: {
    type: 'option_55_filter',
    hideWhen: [],
    showOnly: {
      subcategories: [39],
      options: [716, 1017, 718, 719, 720]
    }
  }
}

export function shouldHideOption(option: Option, selectedOptions: Map<number, Option>): boolean {
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
      case 'option_55_filter':
        if (selectedOption.id === 55) {
          // Hide if option is in the explicitly hidden list
          const hiddenOptions = [734, 735, 736, 737, 738, 1019, 1021, 1023, 1022, 1020, 1024, 1025, 1026, 1027, 1028]
          if (hiddenOptions.includes(option.id)) return true

          // Hide if option's subcategory should be hidden
          const hiddenSubcategories = [40, 41, 44]
          if (hiddenSubcategories.includes(option.id_related_subcategory)) return true
        }
        break
    }
  }
  return false
}

export function shouldHideSubcategory(subcategory: Subcategory, selectedOptions: Map<number, Option>): boolean {
  for (const [, selectedOption] of selectedOptions) {
    const rule = FILTER_RULES[selectedOption.id]
    if (!rule) continue

    if (rule.type === 'option_55_filter' && selectedOption.id === 55) {
      const hiddenSubcategories = [40, 41, 44]
      if (hiddenSubcategories.includes(subcategory.id)) return true
    }
  }
  return false
} 