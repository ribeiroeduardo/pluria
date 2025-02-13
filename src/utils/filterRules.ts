import type { Option } from '@/types/guitar'

interface FilterRule {
  type: 'strings' | 'scale_length' | 'color_hardware'
  hideWhen: string
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
    }
  }
  return false
} 